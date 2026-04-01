const express = require('express');
const router = express.Router();
const {getProductoBySku,crearProducto} = require('../controllers/productoController');
const {verificarToken} = require('../middlewares/authMiddleware');

router.get('/:sku',verificarToken,getProductoBySku);
router.post('/',verificarToken,crearProducto);

module.exports = router;
