const {Pool} = require('pg');
const {createClient} = require('redis');

const credencialesComunes = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT || 5432,
	ssl: {
		rejectUnauthorized: false
	}
};

const writePool = new Pool({
	...credencialesComunes,
	host: process.env.DB_WRITE_HOST
});

const readPool = new Pool({
	...credencialesComunes,
	host: process.env.DB_READ_HOST
});


const redisClient = createClient({
	url: process.env.REDIS_URL
//'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('error en redis: ',err));
module.exports = {writePool, readPool, redisClient};

