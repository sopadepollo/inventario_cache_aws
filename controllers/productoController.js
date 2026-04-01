const {pool,redisClient} = require('../config/db');

const getProductoBySku = async (req,res) => {
	const {sku} = req.params;
	try{
		const productoCachead0 = await redisClient.get(`producto:${sku}`);
		if(productoCachead0){
			console.log('Hit en cache, resp rapida');
			return res.json(JSON.parse(productoCachead0));
		}
		console.log('Miss en cache, resp rapida');
		const result = await pool.query('SELECT * FROM productos WHERE sku = $1', [sku]);
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
	const {sku,nombre,descripcion,precio} = req.body;
	try{
		const result = await pool.query(
			'INSERT INTO productos (sku,nombre,descripcion,precio) VALUES ($1,$2,$3,$4) RETURNING *',
			[sku,nombre,descripcion,precio]
		);
		res.status(201).json({mensaje:'producto creado',producto:result.rows[0]});
	}catch(error){
		console.error(error);
		if(error.code === '23505'){
			return res.status(409).json({error:'el sku ya existe'});
		}
		res.status(500).json({error:'error al crear el producto'});
	}
};
module.exports = {getProductoBySku,crearProducto};
