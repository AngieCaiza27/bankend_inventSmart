const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');

// 1️⃣ Registrar una venta
router.post('/', ventasController.registrarVenta);

// 2️⃣ Historial completo de ventas
router.get('/historial', ventasController.historialVentas);

// 3️⃣ Detalle de ventas por producto
router.get('/producto/:id', ventasController.detallePorProducto);

module.exports = router;
