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
