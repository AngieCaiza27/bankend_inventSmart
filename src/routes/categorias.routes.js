// src/routes/categoria.routes.js
const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoria.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas públicas para usuarios autenticados (empleados y admin)
router.get('/', CategoriaController.getAll);
router.get('/:id', CategoriaController.getById);

// Rutas solo para administradores
router.post('/', isAdmin, CategoriaController.create);
router.put('/:id', isAdmin, CategoriaController.update);
router.delete('/:id', isAdmin, CategoriaController.delete);

module.exports = router;