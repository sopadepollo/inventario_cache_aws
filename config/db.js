const {Pool} = require('pg');
const {createClient} = require('redis');

const pool = new Pool({
	user: 'dev_admin',
	password: 'dev_password_seguro',
	host: 'localhost',
	database: 'inventario_api',
	port: 5432,
});


const redisClient = createClient({
	url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('error en redis: ',err));
module.exports = {pool, redisClient};

