const MG = require("../utils/mongoose.js");
const Priviledge = require("../middleware/priviledge.js")
const Exceptions = require("../utils/exceptions.js")

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROUNDS = 12;

/* */

const UserSchema = MG.mongoose.Schema({
	_id: {
		type: MG.schTypes.ObjectId,
		auto: true
	},
	uname: {
		type: String,
		required: true,
		unique: true
	},
	hash: {
		type: String,
		required: true
	},
	/* This field might be unneeded, as it is possible to extract
	 * creation date from the id itself (_id.getTimestamp()) */
	creation: {
		type: Date,
		default: Date
	},
	lastLogin: {
		type: Date,
		default: Date
	},
	tokens: [String],
	priviledge: {
		type: Number,
		default: Priviledge.NORMAL
	}
});

const PASSWORD = "password";
const EXPIRATION_TIME = "10 minutes";

UserSchema.statics.findByCredentials = async function(uname, passwd)
{
	MG.config();

	const user = await User.findOne({uname: uname});
	if (user === null)
		throw new Exceptions.InexistentResource;

	let confirm = await bcrypt.compare(passwd, user.hash);
	if (confirm)
		return user;
	else
		throw new Exceptions.InvalidCredentials;
	
}

UserSchema.statics.checkIfAuth = async function(token, priviledgeLevel)
{
	let decode;
	try {
		decode = jwt.verify(token, PASSWORD);
	} catch (e) {
		throw new Exceptions.TokenExpired;
	}

	MG.config();

	let user = await this.findOne({uname: decode.uname});
	if (!user)
		throw new Exceptions.InexistentResource;
	
	user.removeOldTokens();

	if (user.tokens.includes(token)){
		console.log("User has valid token.");
		console.log(`Priviledges needed are ${priviledgeLevel}, `
			+ `user has ${user.priviledge}`);
		if (user.priviledge >= priviledgeLevel)
			return user;
		else
			throw new Exceptions.WrongPriviledges;
	}
	else
		throw new Exceptions.InvalidCredentials;
}

UserSchema.methods.removeOldTokens = async function()
{
	let model = this.constructor;
	this.tokens.forEach( async (token) => {
		try {
			let decode = jwt.verify(token, PASSWORD);
		} catch {
			await model.updateOne(
				{_id: this._id},
				{$pull:
					{tokens: token}
			});
		}
	});
}

UserSchema.statics.logOut = async function(token)
{
	MG.config();

	let decode = jwt.decode(token);
	let user = await this.updateOne(
		{ uname: decode.uname },
		{ $pull: 
			{tokens: token}
	});
}

UserSchema.methods.newAuthToken = async function()
{
	/* will generate a new authToken for the user
	 */
	await this.removeOldTokens();

	let token = jwt.sign(
		{
			uname: this.uname
		},
		PASSWORD,
		{expiresIn: EXPIRATION_TIME});

	let model = this.constructor;

	await model.updateOne(
		{ 
			_id: this._id 
		}, 
		{
			$push: { tokens: token },
			$set: { lastLogin: new Date() }
		}
	);

	return token;
}

UserSchema.statics.addUser = 
async function(uname, passwd)
{
	MG.config();

	if (typeof(uname) !== "string")
		throw new Exceptions.InvalidInput("Username must be a string");
	if (uname.length < 6)
		throw new Exceptions.InvalidInput("Username is too short");
	
	let user = await this.findOne({uname: uname});
	if (user !== null)
		throw new Exceptions.AlreadyExistent("User already exists.");

	let hash = await bcrypt.hash(passwd, ROUNDS);
	let newUser = new this({
		uname: uname,
		hash: hash
	});
	await newUser.save();

	return newUser;
}

const User = MG.mongoose.model("User", UserSchema, "User");

module.exports = User;