const {Pool} = require('pg');
const {createClient} = require('redis');

const pool = new Pool({
	user: 'dev_admin',
	password: 'dev_password_seguro',
	host: 'inventario-db.cohqgs2km9z5.us-east-1.rds.amazonaws.com:5432',
	database: 'inventario_api',
	port: 5432,
});

const redisClient = createClient({
	url: 'inventario-redis.cowen7.0001.use1.cache.amazonaws.com'
});

redisClient.on('error', (err) => console.log('error en redis: ',err));
module.exports = {pool, redisClient}
