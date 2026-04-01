const express = require('express');
const router = express.Router();
const { registrarMovimiento } = require('../controllers/inventarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Protegemos la ruta: solo alguien logueado (con Token) puede mover inventario
router.post('/movimiento', verificarToken, registrarMovimiento);

module.exports = router;
