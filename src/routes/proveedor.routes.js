// src/routes/proveedor.routes.js
const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/proveedor.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas públicas para usuarios autenticados
router.get('/', ProveedorController.getAll);
router.get('/:id', ProveedorController.getById);
router.get('/:id/categorias', ProveedorController.getCategories);

// Rutas solo para administradores
router.post('/', isAdmin, ProveedorController.create);
router.put('/:id', isAdmin, ProveedorController.update);
router.patch('/:id/status', isAdmin, ProveedorController.changeStatus);
router.delete('/:id', isAdmin, ProveedorController.delete);

module.exports = router;