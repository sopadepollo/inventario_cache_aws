const {readPool,redisClient} = require('../config/db');
const {SQSClient, SendMessageCommand} = require("@aws-sdk/client-sqs");

const sqsClient = new SQSClient({region: process.env.AWS_REGION});

const {enviarACola} = require('../services/sqsService'); 

const getProductoBySku = async (req,res) => {
	const {sku} = req.params;
	try{
		const productoCachead0 = await redisClient.get(`producto:${sku}`);
		if(productoCachead0){
			console.log('Hit en cache, resp rapida');
			return res.json(JSON.parse(productoCachead0));
		}
		console.log('Miss en cache, resp rapida');
		const result = await readPool.query('SELECT * FROM productos WHERE sku = $1', [sku]);
		if(result.rows.length === 0){
			return res.status(404).json({error:'producto no encontrado'});
		}
		const producto = result.rows[0];
		await redisClient.setEx(`producto:${sku}`, 3600, JSON.stringify(producto));
		res.json(producto);
	}catch(error){
		console.error(error);
		res.status(500).json({error: 'error del servidor'});
	}
};

const crearProducto = async (req,res) => {
	try{
		await enviarACola('CREAR_PRODUCTO', req.body);
		res.status(202).json({mensaje:'producto encolado'});
	}catch(error){
		res.status(500).json({error:'error al encolar el producto'});
	}
};
module.exports = {getProductoBySku,crearProducto};
