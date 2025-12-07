const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');

//  Registrar una venta
router.post('/', ventasController.registrarVenta);

//  Historial completo de ventas
router.get('/historial', ventasController.historialVentas);

//  Detalle de ventas por producto
router.get('/producto/:id', ventasController.detallePorProducto);

// Detalle de ventas por producto
router.get('/producto/:id', ventasController.detallePorProducto);

// **Nueva ruta: total de ventas hoy**
router.get('/total-hoy', ventasController.totalVentasHoy);
module.exports = router;
