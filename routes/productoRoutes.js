const express = require('express');
const router = express.Router();
const {getProductoBySku,crearProducto,actualizarProducto} = require('../controllers/productoController');
const {verificarToken} = require('../middlewares/authMiddleware');

router.get('/:sku',verificarToken,getProductoBySku);
router.post('/',verificarToken,crearProducto);
router.put('/:sku',verificarToken,actualizarProducto);
//router.delete('/:sku',verificarToken,eliminarProducto);
module.exports = router;
