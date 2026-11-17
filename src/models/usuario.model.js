// src/models/usuario.model.js
const { pool } = require('../config/database');

class UsuarioModel {
    // Crear nuevo usuario
    static async create(userData) {
        const { nombre, correo, contrasena, rol = 'empleado' } = userData;
        const query = `
            INSERT INTO usuarios (nombre, correo, contrasena, rol, estado) 
            VALUES (?, ?, ?, ?, TRUE)
        `;
        const [result] = await pool.execute(query, [nombre, correo, contrasena, rol]);
        return result.insertId;
    }

    // Buscar usuario por correo
    static async findByEmail(correo) {
        const query = 'SELECT * FROM usuarios WHERE correo = ?';
        const [rows] = await pool.execute(query, [correo]);
        return rows[0];
    }

    // Buscar usuario por ID
    static async findById(id) {
        const query = 'SELECT id, nombre, correo, rol, estado FROM usuarios WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Obtener todos los usuarios (sin contraseñas)
    static async findAll() {
        const query = 'SELECT id, nombre, correo, rol, estado FROM usuarios ORDER BY id DESC';
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Actualizar usuario
    static async update(id, userData) {
        const { nombre, correo, rol, estado } = userData;
        const query = `
            UPDATE usuarios 
            SET nombre = ?, correo = ?, rol = ?, estado = ?
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [nombre, correo, rol, estado, id]);
        return result.affectedRows > 0;
    }

    // Actualizar contraseña
    static async updatePassword(id, nuevaContrasena) {
        const query = 'UPDATE usuarios SET contrasena = ? WHERE id = ?';
        const [result] = await pool.execute(query, [nuevaContrasena, id]);
        return result.affectedRows > 0;
    }

    // Cambiar estado del usuario (activar/desactivar)
    static async changeStatus(id, estado) {
        const query = 'UPDATE usuarios SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [estado, id]);
        return result.affectedRows > 0;
    }

    // Eliminar usuario (soft delete - cambiar estado a false)
    static async softDelete(id) {
        return await this.changeStatus(id, false);
    }

    // Verificar si el correo ya existe
    static async emailExists(correo, excludeId = null) {
        let query = 'SELECT id FROM usuarios WHERE correo = ?';
        let params = [correo];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }
}

module.exports = UsuarioModel;