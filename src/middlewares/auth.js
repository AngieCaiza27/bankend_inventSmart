// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

// Verificar token JWT
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Agregar info del usuario al request
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};


// Verificar que el usuario esté activo
const isActive = (req, res, next) => {
    if (!req.user.estado) {
        return res.status(403).json({
            success: false,
            message: 'Usuario inactivo'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isActive
};