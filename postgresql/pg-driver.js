const { Pool } = require('pg');

config = {
	user: 'moraesvic',
	password: 'victor',
	host: 'localhost',
	database: 'vulpi',
	port: 5432
};

let pool;

function getPool()
{
	if(!pool)
		pool = new Pool(config);
	return pool;
}

async function endPool()
{
	if(pool)
		await pool.end();
	return true;
}

let intervalRemoveOldTokens;

function removeOldTokens()
{
	/* */
	if (intervalRemoveOldTokens)
		return;

	async function _removeOldTokens()
	{
		const pool = getPool();
		const client = await pool.connect();
		await client.query(
			"SELECT * FROM fn_user_remove_old_tokens();",
			[]
		);
		client.release();
	}

	intervalRemoveOldTokens = 
		setInterval(_removeOldTokens, 1000 * 60 * 60 * 24);
	
	return intervalRemoveOldTokens;
}

async function main()
{
	const pool = getPool();
	const client = await pool.connect();
	let res;

	/* GOOD QUERY - CONVENTIONAL */
	try {
		res = await client.query("SELECT * FROM users");
		console.log(res.rows);
	} catch(e) {
		console.log(e);
	}

	/* GOOD QUERY - long but CONVENTIONAL */
	try {
		res = await client.query(
			`
			SELECT
				fn_lang_get_iso(it.lang_id) AS iso,
				it.trans_value 				AS translation
			FROM
				fn_lang_get_from_iso( $1 ) lg
			JOIN
				indiv_translations it
			ON
				lg.trans_id = it.trans_id;
			`,
			['en']);
		console.log(res.rows);
	} catch(e) {
		console.log(e);
	}

	/* GOOD QUERY - FUNCTION */
	try {
		res = await client.query(
			"SELECT * FROM fn_lang_get_all_trans($1);",
			['pt']
		);
		console.log(res.rows);
	} catch(e) {
		console.log(e);
	}

	/* MALFORMED QUERY */
	try {
		res = await client.query("SELECT * asdadsd");
		console.log(res.rows);
	} catch(e) {
		console.log(e); // error: syntax error at or near "asdadsd"
	}

	/* EMPTY RESPONSE */
	try {
		res = await client.query("SELECT * FROM users WHERE user_name = 'xxxx'");
		console.log(res.rows); // []
	} catch(e) {
		console.log(e); 
	}
	;
	/* INSERTING STUFF */
	try {
		res = await client.query(
			"SELECT * FROM fn_user_new($1, $2)",
			['anonymous', 'password']);
		console.log(res);
	} catch(e) {
		console.log(e); 
	}

	/* INSERTING STUFF - SHOULD GIVE ERROR */
	try {
		res = await client.query(
			"SELECT * FROM fn_user_new($1, $2)",
			['userrr', 'password']);
		console.log(res);
	} catch(e) {
		console.log(e); // error: duplicate key value violates unique constraint "users_user_name_key"
		console.log(e.name);
	}

	/* raw query -- no SQL function */
	try {
		res = await client.query(
			"INSERT INTO whatever (str, number) VALUES ($1, $2) RETURNING *",
			['some text', 6969]);
		console.log(res);
	} catch(e) {
		console.log(e);
		console.log(e.name);
	}

	;


	
	

	client.release();
	await endPool();
}


if (require.main === module)
	main();

