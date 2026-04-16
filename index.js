require('dotenv').config();
const express = require('express');
const {pool, redisClient} = require('./config/db');

const app = express();
app.use(express.json()); // Middleware para poder leer JSON en el body

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const productoRoutes = require('./routes/productoRoutes');
app.use('/api/productos', productoRoutes);

const inventarioRoutes = require('./routes/inventarioRoutes');
app.use('/api/inventario', inventarioRoutes);

// 3. Ruta de prueba (Ping)
app.get('/ping', async (req, res) => {
  try {
    // Probamos leer la fecha actual desde Postgres
    const pgRes = await pool.query('SELECT NOW()');
    
    // Probamos escribir y leer en Redis
    await redisClient.set('prueba_cache', '¡Redis está vivo!');
    const redisRes = await redisClient.get('prueba_cache');

    res.json({
      mensaje: '¡Todo el stack está funcionando!',
      postgres_db: pgRes.rows[0].now,
      redis_cache: redisRes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error conectando a las bases de datos' });
  }
});

app.get('/api/productos', async(req,res)=>{
	try{
		//extraer variables que se encuentren dentro de la query de nuestra url
		const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
		const limit = req.query.limit ? parseInt(req.query.limit) : 20;

		let queryText;
		let queryValue;
		//maneja en caso de que si tenga un cursor a donde ir o si no, agarra los ultmimos
		if(cursor){
			queryText = 'SELECT * FROM productos WHERE id < $1 ORDER BY id DESC LIMIT $2';
			queryValue = [cursor, limit];
		}else{
			queryText = 'SELECT * FROM productos ORDER BY id DESC LIMIT $1';
			queryValue = [limit];
		}
		//al armar el texto como los valores, los mandamos con una query del pool
		const {rows} = await pool.query(queryText, queryValue);
		//en caso de que en la longitud de los rows que nos llego sean igual que la longitud mandada a solicitar, eso puede
		//significar que muy probablemente haya mas datos despues
		const hayMas = rows.length === limit;
		//el nuevo cursor sera identificado como el id del ultimo elemento obtenido de la tanda para saber donde seguir
		const siguienteCursor = hayMas ? rows[rows.length - 1].id : null;
		//respuesta de la data esperada en conjunto con nuestra metadata para ubicarnos
		res.json({
			datos: rows,
			meta: {
				hay_mas: hayMas,
				siguiente_cursor: siguienteCursor
			}
		});
	}catch(error){
		console.error('Error en la base de datos:',error);
		res.status(500).json({error:'Error interno del servidor'});
	}
});

const PORT = process.env.PORT || 3000;

// 4. Iniciar servicios
const iniciarServidor = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Conectado a Redis Exitosamente');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de la API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
};

iniciarServidor();
