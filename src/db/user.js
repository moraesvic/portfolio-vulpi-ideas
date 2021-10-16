const DB = require("./postgres.js");
const Priviledge = require("../middleware/priviledge.js")
const Exceptions = require("../utils/exceptions.js")

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ms = require('ms');

const ROUNDS = 12;
const PASSWORD = "password";
const EXPIRATION_TIME = "10 minutes";

/* */
async function setPriviledge(uname, priviledge)
{
	console.log(`Setting priviledge ${priviledge} for ${uname}`);
	console.log(Priviledge);
	if ( !(priviledge in Priviledge) )
		throw new Exceptions.InvalidInput;

	let users = await DB.query(
		"SELECT * FROM fn_user_set_priviledge( $1, $2 );",
		[ uname, priviledge ]
	);
	if (users.rows.length === 0)
		throw new Exceptions.InexistentResource;

	return users.rows[0];
}

async function findByCredentials(uname, passwd)
{
	let users = await DB.query(
		"SELECT * FROM fn_user_find_by_uname( $1 );",
		[ uname ]
	);
	if (users.rows.length === 0)
		throw new Exceptions.InexistentResource;

	let user = users.rows[0];
	let confirm = await bcrypt.compare(passwd, user.user_hash);
	if (confirm)
		return user;
	else
		throw new Exceptions.InvalidCredentials;
}

async function findByUname(uname)
{
	let users = await DB.query(
		"SELECT * FROM fn_user_find_by_uname( $1 );",
		[ uname ]
	);
	if (users.rows.length === 0)
		throw new Exceptions.InexistentResource;

	return users.rows[0];
}


async function add(uname, passwd)
{
	/* validation */
	if (typeof(uname) !== "string")
		throw new Exceptions.InvalidInput("Username must be a string");
	if (uname.length < 6)
		throw new Exceptions.InvalidInput("Username is too short");

	let users = await DB.query(
		"SELECT * FROM fn_user_find_by_uname( $1 );",
		[ uname ]
	);
	if (users.rows.length > 0)
		throw new Exceptions.AlreadyExistent("User already exists.");

	let hash = await bcrypt.hash(passwd, ROUNDS);
	let newUser = await DB.query(
		"SELECT * FROM fn_user_new( $1 , $2 );",
		[ uname, hash ]
	);
	return newUser;
}

async function newAuthToken(uname)
{
	/* will generate a new authToken for the user
	 */
	let token = jwt.sign(
		{ uname: uname },
		PASSWORD,
		{expiresIn: EXPIRATION_TIME}
	);

	let expires = new Date(new Date().getTime() + ms(EXPIRATION_TIME));
	let expiresStr = 
		expires
		.toISOString()
		.replace('T', ' ')
		.replace('Z', '+')
		+ '00';

	DB.query(
		'SELECT * FROM fn_user_add_token( $1 , $2 , $3 )',
		[ uname, token, expiresStr ]
	).then(user => { console.log( user.rows )});

	return token;
}

async function checkIfAuth(token, priviledgeLevel)
{
	removeOldTokens();
	let decode;
	try {
		decode = jwt.verify(token, PASSWORD);
	} catch (e) {
		throw new Exceptions.TokenExpired;
	}

	let users = await DB.query(
		"SELECT * FROM fn_user_check_if_auth( $1, $2 );",
		[ decode.uname, token ]
	);

	if (users.rows.length === 0)
		throw new Exceptions.InexistentResource;

	let user = users.rows[0];

	console.log("User has valid token.");
		console.log(`Priviledges needed are ${priviledgeLevel}, `
			+ `user has ${Priviledge[user.user_priviledge]}`);

	if (Priviledge[user.user_priviledge] < priviledgeLevel)
		throw new Exceptions.WrongPriviledges;

	return users.rows[0];
}

async function logout(token)
{
	let decode;
	try {
		decode = jwt.verify(token, PASSWORD);
	} catch (e) {
		throw new Exceptions.TokenExpired;
	}

	let removedTokens = await DB.query(
		"SELECT * FROM fn_user_logout( $1, $2 );",
		[ decode.uname, token ]
	);
	return removedTokens;
}

async function removeOldTokens()
{
	let res = await DB.query(
		"SELECT * FROM fn_user_remove_old_tokens();",
		[]
	);
	let count = res.rows.length > 0 ?
				res.rows[0].o_removed_tokens :
				'No';
		
	console.log(`${count} old tokens were removed`);
}

module.exports = {
	add: add,
	checkIfAuth: checkIfAuth,
	findByCredentials: findByCredentials,
	findByUname: findByUname,
	logout: logout,
	newAuthToken: newAuthToken,
	setPriviledge: setPriviledge
};