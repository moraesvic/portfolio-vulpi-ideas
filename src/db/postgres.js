const PG = require('pg').Pool;

config = {
	user: 'moraesvic',
	password: 'victor',
	host: 'localhost',
	database: 'vulpi',
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