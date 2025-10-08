// src/models/categoria.model.js
const { pool } = require('../config/database');

class CategoriaModel {
    // Crear nueva categoría
    static async create(categoriaData) {
        const { nombre, descripcion } = categoriaData;
        const query = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
        const [result] = await pool.execute(query, [nombre, descripcion || null]);
        return result.insertId;
    }

    // Obtener todas las categorías
    static async findAll() {
        const query = 'SELECT * FROM categorias ORDER BY nombre ASC';
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Buscar categoría por ID
    static async findById(id) {
        const query = 'SELECT * FROM categorias WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Actualizar categoría
    static async update(id, categoriaData) {
        const { nombre, descripcion } = categoriaData;
        const query = 'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?';
        const [result] = await pool.execute(query, [nombre, descripcion || null, id]);
        return result.affectedRows > 0;
    }

    // Eliminar categoría
    static async delete(id) {
        const query = 'DELETE FROM categorias WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Verificar si la categoría tiene productos asociados
    static async hasProducts(id) {
        const query = 'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0].count > 0;
    }

    // Verificar si el nombre ya existe
    static async nameExists(nombre, excludeId = null) {
        let query = 'SELECT id FROM categorias WHERE nombre = ?';
        let params = [nombre];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }

    // Contar productos por categoría
    static async countProducts(id) {
        const query = 'SELECT COUNT(*) as count FROM productos WHERE categoria_id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0].count;
    }
}

module.exports = CategoriaModel;