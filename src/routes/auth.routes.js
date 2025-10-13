// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');


// Ruta pública
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);  // Agregada
router.post('/reset-password', AuthController.resetPassword);    // Agregada

// Rutas protegidas
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/change-password', verifyToken, AuthController.changePassword);








module.exports = router;

