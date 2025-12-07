// src/models/proveedor.model.js
const { pool } = require('../config/database');

class ProveedorModel {
    // Crear nuevo proveedor
    static async create(proveedorData) {
        const { empresa, contacto } = proveedorData;
        const query = 'INSERT INTO proveedores (empresa, contacto, estado) VALUES (?, ?, TRUE)';
        const [result] = await pool.execute(query, [empresa, contacto || null]);
        return result.insertId;
    }

    // Obtener todos los proveedores
    static async findAll(includeInactive = false) {
        let query = 'SELECT * FROM proveedores';
        if (!includeInactive) {
            query += ' WHERE estado = TRUE';
        }
        query += ' ORDER BY empresa ASC';
        const [rows] = await pool.execute(query);
        return rows;
    }

    // Buscar proveedor por ID
    static async findById(id) {
        const query = 'SELECT * FROM proveedores WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    // Actualizar proveedor
    static async update(id, proveedorData) {
        const { empresa, contacto, estado } = proveedorData;
        const query = 'UPDATE proveedores SET empresa = ?, contacto = ?, estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [empresa, contacto || null, estado, id]);
        return result.affectedRows > 0;
    }

    // Cambiar estado del proveedor
    static async changeStatus(id, estado) {
        const query = 'UPDATE proveedores SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(query, [estado, id]);
        return result.affectedRows > 0;
    }

    // Eliminar proveedor (soft delete)
    static async softDelete(id) {
        return await this.changeStatus(id, false);
    }

    // Eliminar proveedor permanentemente
    static async delete(id) {
        const query = 'DELETE FROM proveedores WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Verificar si tiene productos asociados
    static async hasProducts(id) {
        const query = 'SELECT COUNT(*) as count FROM productos WHERE proveedor_id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0].count > 0;
    }

    // Contar productos por proveedor
    static async countProducts(id) {
        const query = 'SELECT COUNT(*) as count FROM productos WHERE proveedor_id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0].count;
    }

    // ========== GESTIÓN DE CATEGORÍAS DEL PROVEEDOR ==========

    // Asignar categoría a proveedor
    static async assignCategory(proveedorId, categoriaId) {
        const query = `
            INSERT INTO proveedor_categoria (id_proveedor, id_categoria, estado) 
            VALUES (?, ?, TRUE)
            ON DUPLICATE KEY UPDATE estado = TRUE
        `;
        const [result] = await pool.execute(query, [proveedorId, categoriaId]);
        return result.affectedRows > 0;
    }

    // Remover categoría de proveedor
    static async removeCategory(proveedorId, categoriaId) {
        const query = 'DELETE FROM proveedor_categoria WHERE id_proveedor = ? AND id_categoria = ?';
        const [result] = await pool.execute(query, [proveedorId, categoriaId]);
        return result.affectedRows > 0;
    }

    // Obtener categorías de un proveedor
    static async getCategories(proveedorId) {
        const query = `
            SELECT c.id, c.nombre, c.descripcion, pc.estado
            FROM categorias c
            INNER JOIN proveedor_categoria pc ON c.id = pc.id_categoria
            WHERE pc.id_proveedor = ? AND pc.estado = TRUE
            ORDER BY c.nombre ASC
        `;
        const [rows] = await pool.execute(query, [proveedorId]);
        return rows;
    }

    // Obtener proveedor con sus categorías
    static async findByIdWithCategories(id) {
        const proveedor = await this.findById(id);
        if (!proveedor) return null;

        const categorias = await this.getCategories(id);
        return {
            ...proveedor,
            categorias
        };
    }

    // Actualizar todas las categorías de un proveedor
    static async updateCategories(proveedorId, categoriasIds) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Eliminar todas las categorías actuales
            await connection.execute(
                'DELETE FROM proveedor_categoria WHERE id_proveedor = ?',
                [proveedorId]
            );

            // Insertar las nuevas categorías
            if (categoriasIds && categoriasIds.length > 0) {
                const values = categoriasIds.map(catId => [proveedorId, catId, true]);
                const placeholders = values.map(() => '(?, ?, ?)').join(', ');
                const flatValues = values.flat();

                await connection.execute(
                    `INSERT INTO proveedor_categoria (id_proveedor, id_categoria, estado) VALUES ${placeholders}`,
                    flatValues
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Verificar si el nombre de empresa ya existe
    static async empresaExists(empresa, excludeId = null) {
        let query = 'SELECT id FROM proveedores WHERE empresa = ?';
        let params = [empresa];
        
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }

    // Contar total de proveedores
    static async countAll(includeInactive = false) {
        let query = 'SELECT COUNT(*) as total FROM proveedores';
        if (!includeInactive) {
            query += ' WHERE estado = TRUE';
        }
        const [rows] = await pool.execute(query);
        return rows[0].total;
    }

    // Estadísticas de proveedores
    static async getEstadisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_proveedores,
                COUNT(CASE WHEN estado = TRUE THEN 1 END) as proveedores_activos,
                COUNT(CASE WHEN estado = FALSE THEN 1 END) as proveedores_inactivos,
                (SELECT COUNT(DISTINCT id_proveedor) FROM proveedor_categoria) as proveedores_con_categorias,
                (SELECT COUNT(*) FROM productos WHERE proveedor_id IS NOT NULL) as total_productos_asociados
            FROM proveedores
        `;
        const [rows] = await pool.execute(query);
        return rows[0];
    }

    static async deleteById(id, connection = null) {
        const exec = connection ? connection.execute.bind(connection) : pool.execute.bind(pool);
        const [result] = await exec('DELETE FROM proveedores WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async deletePivotByProveedor(id, connection = null) {
        const exec = connection ? connection.execute.bind(connection) : pool.execute.bind(pool);
        await exec('DELETE FROM proveedor_categoria WHERE id_proveedor = ?', [id]);
    }

    // Buscar proveedores por nombre (empresa)
    // src/models/proveedor.model.js
    static async findByName(nombreEmpresa) {
        const query = 'SELECT * FROM proveedores WHERE LOWER(empresa) = LOWER(?) LIMIT 1';
        const [rows] = await pool.execute(query, [nombreEmpresa]);
        return rows[0] || null;
    }
}

module.exports = ProveedorModel;