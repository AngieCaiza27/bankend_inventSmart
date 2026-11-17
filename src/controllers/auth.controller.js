// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuario.model');
const { sendResetCode } = require('../config/email.config');  // AGREGADO
//const db = require('../config/database'); 
const { pool } = require('../config/database');

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

    // Solicitar código de recuperación de contraseña
    static async forgotPassword(req, res) {
        try {
            const { correo } = req.body;

            if (!correo) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo es obligatorio'
                });
            }

            // Verificar si el usuario existe
            const usuario = await UsuarioModel.findByEmail(correo);
            
            // Por seguridad, siempre responder igual
            if (!usuario) {
                return res.json({
                    success: true,
                    message: 'Si el correo existe, recibirás un código de recuperación'
                });
            }

            // Generar código aleatorio de 6 dígitos
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // Calcular fecha de expiración (15 minutos)
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            // Guardar código en la base de datos
            await pool.query(
                'INSERT INTO reseteo_clave (user_email, token, expires_at) VALUES (?, ?, ?)',
                [correo, code, expiresAt]
            );

            // Enviar email con SendGrid
            const emailResult = await sendResetCode(correo, code);

            if (!emailResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al enviar el correo electrónico'
                });
            }

            res.json({
                success: true,
                message: 'Si el correo existe, recibirás un código de recuperación'
            });

        } catch (error) {
            console.error('Error en forgotPassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la solicitud',
                error: error.message
            });
        }
    }

    // Verificar código sin consumirlo
static async verifyCode(req, res) {
    try {
        const { correo, codigo } = req.body;

        if (!correo || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Correo y código son obligatorios'
            });
        }

        // Buscar código válido SIN marcarlo como usado
        const [resets] = await pool.query(
            `SELECT * FROM reseteo_clave 
             WHERE user_email = ? 
             AND token = ? 
             AND usado = FALSE 
             AND expires_at > NOW() 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [correo, codigo]
        );

        if (!resets || resets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido o expirado'
            });
        }

        res.json({
            success: true,
            message: 'Código válido'
        });

    } catch (error) {
        console.error('Error en verifyCode:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar código',
            error: error.message
        });
    }
}

    // Resetear contraseña con el código recibido
    static async resetPassword(req, res) {
        try {
            const { correo, codigo, nuevaContrasena } = req.body;

            if (!correo || !codigo || !nuevaContrasena) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios'
                });
            }

            if (nuevaContrasena.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Buscar código válido
            const [resets] = await pool.query(
                `SELECT * FROM reseteo_clave 
                 WHERE user_email = ? 
                 AND token = ? 
                 AND usado = FALSE 
                 AND expires_at > NOW() 
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [correo, codigo]
            );

            if (!resets || resets.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Código inválido o expirado'
                });
            }

            // Encriptar nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const contrasenaHash = await bcrypt.hash(nuevaContrasena, salt);

            // Actualizar contraseña
            const usuario = await UsuarioModel.findByEmail(correo);
            await UsuarioModel.updatePassword(usuario.id, contrasenaHash);

            // Marcar código como usado
            await pool.query(
                'UPDATE reseteo_clave SET usado = TRUE WHERE id = ?',
                [resets[0].id]
            );

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error al resetear la contraseña',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;