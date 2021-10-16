const PG = require('pg').Pool;

/* This is not yet properly configured. Actually, this server version is not
using PostgreSQL, as I did not have time to rewrite all the MongoDB routines
for Postgres. This is just for future use */
config = {
	user: 'username',
	password: 'password',
	host: 'localhost',
	database: 'portfolio_vulpi_ideas',
	port: 5432
};

class DB {
	constructor()
	{
		this.pool = new PG(config);
	}

	getPool()
	{
		if(!this.pool)
			this.pool = new PG(config);
		return this.pool;
	}

	async endPool()
	{
		if(this.pool)
			await this.pool.end();
		return true;
	}

	async query(q, params, options)
	{
		if (!this.pool)
			this.getPool();
		const client = await this.pool.connect();
		let ret = await client.query(q, params);
		client.release();
		return ret;
	}
}

const db = new DB();

module.exports = db;