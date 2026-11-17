// src/routes/producto.routes.js
const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas públicas para usuarios autenticados (empleados y admin)
router.get('/', ProductoController.getAll);
router.get('/search', ProductoController.search);
router.get('/stock-bajo', ProductoController.getStockBajo);
router.get('/estadisticas', ProductoController.getEstadisticas);
router.get('/:id', ProductoController.getById);
router.get('/:id/historial', ProductoController.getHistorialStock);

// Rutas solo para administradores
router.post('/', isAdmin, ProductoController.create);
router.put('/:id', isAdmin, ProductoController.update);
router.patch('/:id/stock', isAdmin, ProductoController.updateStock);
router.patch('/:id/status', isAdmin, ProductoController.changeStatus);
router.delete('/:id', isAdmin, ProductoController.delete);

module.exports = router;