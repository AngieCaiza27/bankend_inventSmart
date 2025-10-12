// src/models/producto.model.js
const { pool } = require('../config/database');

class ProductoModel {
    // Crear nuevo producto
    static async create(productoData) {
        const { nombre, categoria_id, proveedor_id, precio, stock, stock_minimo } = productoData;

        // Determinar estado inicial basado en stock
        let estado = 'activo';
        if (stock === 0) {
            estado = 'agotado';
        }

        const query = `
            INSERT INTO productos (nombre, categoria_id, proveedor_id, precio, stock, stock_minimo, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            nombre,
            categoria_id || null,
            proveedor_id || null,
            precio,
            stock || 0,
            stock_minimo || 5,
            estado
        ]);

        // Registrar en historial de stock si se crea con stock inicial
        if (stock && stock > 0) {
            await this.registrarCambioStock(result.insertId, stock, 'Stock inicial');
        }

        return result.insertId;
    }

    // Obtener todos los productos
    static async findAll(filters = {}) {
        let query = `
            SELECT 
                p.*,
                c.nombre as categoria_nombre,
                pr.empresa as proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
        `;

        const conditions = [];
        const params = [];

        // Filtros
        if (filters.categoria_id) {
            conditions.push('p.categoria_id = ?');
            params.push(filters.categoria_id);
        }

        if (filters.proveedor_id) {
            conditions.push('p.proveedor_id = ?');
            params.push(filters.proveedor_id);
        }

        if (filters.estado) {
            conditions.push('p.estado = ?');
            params.push(filters.estado);
        }

        if (filters.stock_bajo) {
            conditions.push('p.stock <= p.stock_minimo');
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.nombre ASC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Buscar producto por ID
    static async findById(id) {
        const query = `
            SELECT 
                p.*,
                c.nombre as categoria_nombre,
                pr.empresa as proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Actualizar producto
    static async update(id, productoData) {
        const { nombre, categoria_id, proveedor_id, precio, stock_minimo, estado } = productoData;
        const query = `
            UPDATE productos 
            SET nombre = ?, categoria_id = ?, proveedor_id = ?, precio = ?, 
                stock_minimo = ?, estado = ?
            WHERE id = ?
        `;
        const [result] = await pool.execute(query, [
            nombre,
            categoria_id || null,
            proveedor_id || null,
            precio,
            stock_minimo,
            estado,
            id
        ]);
        return result.affectedRows > 0;
    }

    // Actualizar stock (sumar o restar respecto al actual)
    static async updateStock(id, cambio, motivo = 'Ajuste manual') {
        const productoActual = await this.findById(id);
        if (!productoActual) return false;

        const nuevoStock = productoActual.stock + cambio;

        // Evita stock negativo
        if (nuevoStock < 0) return false;

        const query = 'UPDATE productos SET stock = ? WHERE id = ?';
        const [result] = await pool.execute(query, [nuevoStock, id]);

        if (result.affectedRows > 0) {
            await this.registrarCambioStock(id, cambio, motivo);
        }

        return result.affectedRows > 0;
    }
    // Incrementar stock
    static async incrementStock(id, cantidad, motivo = 'Entrada de mercancía') {
        const query = 'UPDATE productos SET stock = stock + ? WHERE id = ?';
        const [result] = await pool.execute(query, [cantidad, id]);

        if (result.affectedRows > 0) {
            await this.registrarCambioStock(id, cantidad, motivo);
        }

        return result.affectedRows > 0;
    }

    // Decrementar stock
    static async decrementStock(id, cantidad, motivo = 'Venta') {
        const query = 'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?';
        const [result] = await pool.execute(query, [cantidad, id, cantidad]);

        if (result.affectedRows > 0) {
            await this.registrarCambioStock(id, -cantidad, motivo);
        }

        return result.affectedRows > 0;
    }

    // Registrar cambio en historial de stock
    static async registrarCambioStock(productoId, cambio, motivo) {
        const query = `
            INSERT INTO historial_stock (producto_id, cambio, motivo) 
            VALUES (?, ?, ?)
        `;
        await pool.execute(query, [productoId, cambio, motivo]);
    }

    // Obtener historial de stock de un producto
    static async getHistorialStock(productoId, limit = 50) {
        // Usar query en lugar de execute para LIMIT dinámico
        const query = `
            SELECT * FROM historial_stock 
            WHERE producto_id = ${pool.escape(productoId)}
            ORDER BY fecha DESC 
            LIMIT ${parseInt(limit)}
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    // Eliminar producto
    static async delete(id) {
        const query = 'DELETE FROM productos WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Cambiar estado del producto
    static async changeStatus(id, estado) {
        const query = 'UPDATE productos SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [estado, id]);
        return result.affectedRows > 0;
    }

    // Obtener productos con stock bajo
    static async getProductosStockBajo() {
        const query = `
            SELECT 
                p.*,
                c.nombre as categoria_nombre,
                pr.empresa as proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            WHERE p.stock <= p.stock_minimo AND p.estado = TRUE
            ORDER BY p.stock ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Verificar si tiene ventas asociadas
    static async hasVentas(id) {
        const query = 'SELECT COUNT(*) as count FROM ventas WHERE producto_id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0].count > 0;
    }

    // Verificar si el nombre ya existe
    static async nombreExists(nombre, excludeId = null) {
        let query = 'SELECT id FROM productos WHERE nombre = ?';
        let params = [nombre];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }

    // Buscar productos por nombre (búsqueda parcial)
    static async searchByName(searchTerm) {
        const query = `
            SELECT 
                p.*,
                c.nombre as categoria_nombre,
                pr.empresa as proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            WHERE p.nombre LIKE ? AND p.estado = TRUE
            ORDER BY p.nombre ASC
        `;
        const [rows] = await pool.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    // Estadísticas de productos
    static async getEstadisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_productos,
                COUNT(CASE WHEN estado = TRUE THEN 1 END) as productos_activos,
                COUNT(CASE WHEN stock <= stock_minimo THEN 1 END) as productos_stock_bajo,
                COUNT(CASE WHEN stock = 0 THEN 1 END) as productos_agotados,
                SUM(stock) as stock_total,
                AVG(precio) as precio_promedio
            FROM productos
        `;
        const [rows] = await pool.execute(query);
        return rows[0];
    }
}

module.exports = ProductoModel;