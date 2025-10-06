// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');

class AuthController {
    // Registro de usuarios
    static async register(req, res) {
        try {
            const { nombre, correo, contrasena, rol } = req.body;

            // Validar campos requeridos
            if (!nombre || !correo || !contrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios'
                });
            }

            // Verificar si el correo ya existe
            const existeUsuario = await UsuarioModel.findByEmail(correo);
            if (existeUsuario) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo ya está registrado'
                });
            }

            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const contrasenaHash = await bcrypt.hash(contrasena, salt);

            // Crear usuario
            const userId = await UsuarioModel.create({
                nombre,
                correo,
                contrasena: contrasenaHash,
                rol: rol || 'empleado'
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    id: userId,
                    nombre,
                    correo,
                    rol: rol || 'empleado'
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    }

    // Login de usuarios
    static async login(req, res) {
        try {
            const { correo, contrasena } = req.body;

            // Validar campos
            if (!correo || !contrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Correo y contraseña son obligatorios'
                });
            }

            // Buscar usuario
            const usuario = await UsuarioModel.findByEmail(correo);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si el usuario está activo
            if (!usuario.estado) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo. Contacte al administrador'
                });
            }

            // Verificar contraseña
            const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
            if (!contrasenaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    correo: usuario.correo,
                    rol: usuario.rol,
                    estado: usuario.estado
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        correo: usuario.correo,
                        rol: usuario.rol
                    }
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: error.message
            });
        }
    }

    // Obtener perfil del usuario autenticado
    static async getProfile(req, res) {
        try {
            const usuario = await UsuarioModel.findById(req.user.id);
            
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }

    // Cambiar contraseña
    static async changePassword(req, res) {
        try {
            const { contrasenaActual, contrasenaNueva } = req.body;
            const userId = req.user.id;

            if (!contrasenaActual || !contrasenaNueva) {
                return res.status(400).json({
                    success: false,
                    message: 'Ambas contraseñas son obligatorias'
                });
            }

            // Obtener usuario con contraseña
            const usuario = await UsuarioModel.findByEmail(req.user.correo);
            
            // Verificar contraseña actual
            const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
            if (!contrasenaValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Encriptar nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const contrasenaHash = await bcrypt.hash(contrasenaNueva, salt);

            // Actualizar contraseña
            await UsuarioModel.updatePassword(userId, contrasenaHash);

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar contraseña',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;