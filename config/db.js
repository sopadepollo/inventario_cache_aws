const {Pool} = require('pg');
const {createClient} = require('redis');

const pool = new Pool({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	ssl: {
		rejectUnauthorized: false
	}
});

const redisClient = createClient({
	url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('error en redis: ',err));
module.exports = {pool, redisClient}
