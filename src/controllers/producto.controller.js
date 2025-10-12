// src/controllers/producto.controller.js
const ProductoModel = require('../models/producto.model');

class ProductoController {
    // Crear producto
    static async create(req, res) {
        try {
            const { nombre, categoria_id, proveedor_id, precio, stock, stock_minimo } = req.body;

            // Validaciones
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del producto es obligatorio'
                });
            }

            if (!precio || precio <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser mayor a 0'
                });
            }

            // Verificar si el nombre ya existe
            const existeNombre = await ProductoModel.nombreExists(nombre);
            if (existeNombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con ese nombre'
                });
            }

            // Crear producto
            const productoId = await ProductoModel.create({
                nombre,
                categoria_id,
                proveedor_id,
                precio,
                stock: stock || 0,
                stock_minimo: stock_minimo || 5
            });

            const producto = await ProductoModel.findById(productoId);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: producto
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear producto',
                error: error.message
            });
        }
    }

    // Obtener todos los productos
    static async getAll(req, res) {
        try {
            const { categoria_id, proveedor_id, estado, stock_bajo } = req.query;

            const filters = {};
            if (categoria_id) filters.categoria_id = categoria_id;
            if (proveedor_id) filters.proveedor_id = proveedor_id;
            if (estado) filters.estado = estado;
            if (stock_bajo === 'true') filters.stock_bajo = true;

            const productos = await ProductoModel.findAll(filters);

            res.json({
                success: true,
                data: productos,
                total: productos.length
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }

    // Obtener producto por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const producto = await ProductoModel.findById(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener producto',
                error: error.message
            });
        }
    }

    // Actualizar producto
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, categoria_id, proveedor_id, precio, stock_minimo, estado } = req.body;

            // Verificar que el producto existe
            const productoExiste = await ProductoModel.findById(id);
            if (!productoExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Validaciones
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del producto es obligatorio'
                });
            }

            if (!precio || precio <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser mayor a 0'
                });
            }

            // Verificar si el nombre ya existe en otro producto
            const existeNombre = await ProductoModel.nombreExists(nombre, id);
            if (existeNombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro producto con ese nombre'
                });
            }

            // Actualizar producto
            await ProductoModel.update(id, {
                nombre,
                categoria_id,
                proveedor_id,
                precio,
                stock_minimo: stock_minimo || 5,
                estado: estado !== undefined ? estado : productoExiste.estado
            });

            const productoActualizado = await ProductoModel.findById(id);

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoActualizado
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    }

    // Actualizar stock
    static async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { stock, motivo } = req.body;
            const cantidad = Number(stock);
            if (isNaN(cantidad) || cantidad < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El stock debe ser un número válido mayor o igual a 0'
                });
            }

            const producto = await ProductoModel.findById(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            await ProductoModel.updateStock(id, cantidad, motivo || 'Ajuste manual');

            const productoActualizado = await ProductoModel.findById(id);

            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: productoActualizado
            });
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar stock',
                error: error.message
            });
        }
    }

    // Obtener historial de stock
    static async getHistorialStock(req, res) {
        try {
            const { id } = req.params;
            const { limit } = req.query;

            const producto = await ProductoModel.findById(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            const limitNum = limit ? parseInt(limit) : 50;
            const historial = await ProductoModel.getHistorialStock(id, limitNum);

            res.json({
                success: true,
                data: {
                    producto: {
                        id: producto.id,
                        nombre: producto.nombre,
                        stock_actual: producto.stock
                    },
                    historial
                }
            });
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener historial de stock',
                error: error.message
            });
        }
    }

    // Obtener productos con stock bajo
    static async getStockBajo(req, res) {
        try {
            const productos = await ProductoModel.getProductosStockBajo();

            res.json({
                success: true,
                data: productos,
                total: productos.length,
                message: productos.length > 0
                    ? `${productos.length} producto(s) con stock bajo`
                    : 'No hay productos con stock bajo'
            });
        } catch (error) {
            console.error('Error al obtener productos con stock bajo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos con stock bajo',
                error: error.message
            });
        }
    }

    // Buscar productos por nombre
    static async search(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar un término de búsqueda'
                });
            }

            const productos = await ProductoModel.searchByName(q);

            res.json({
                success: true,
                data: productos,
                total: productos.length
            });
        } catch (error) {
            console.error('Error al buscar productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar productos',
                error: error.message
            });
        }
    }

    // Cambiar estado del producto
    static async changeStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const producto = await ProductoModel.findById(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Validar estado
            const estadosValidos = ['activo', 'desactivado', 'agotado'];
            if (!estado || !estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
                });
            }

            // No permitir cambiar manualmente a 'agotado' si hay stock
            if (estado === 'agotado' && producto.stock > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede marcar como agotado un producto con stock disponible'
                });
            }

            await ProductoModel.changeStatus(id, estado);

            res.json({
                success: true,
                message: `Producto cambiado a estado: ${estado}`
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar estado del producto',
                error: error.message
            });
        }
    }

    // Eliminar producto
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { force } = req.query; // ?force=true para eliminación física

            const producto = await ProductoModel.findById(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Si force=true, eliminar físicamente (solo si no tiene ventas)
            if (force === 'true') {
                // Verificar si tiene ventas asociadas
                const tieneVentas = await ProductoModel.hasVentas(id);
                if (tieneVentas) {
                    return res.status(400).json({
                        success: false,
                        message: 'No se puede eliminar el producto porque tiene ventas asociadas. Use soft delete (sin ?force=true)'
                    });
                }

                await ProductoModel.delete(id);

                return res.json({
                    success: true,
                    message: 'Producto eliminado permanentemente'
                });
            }

            // Soft delete - solo cambiar estado a false
            await ProductoModel.changeStatus(id, 'desactivado');

            res.json({
                success: true,
                message: 'Producto desactivado exitosamente (soft delete)'
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);

            // Manejar error de foreign key
            if (error.message.includes('foreign key constraint fails')) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el producto porque tiene datos relacionados. Se recomienda desactivarlo en lugar de eliminarlo.'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de productos
    static async getEstadisticas(req, res) {
        try {
            const estadisticas = await ProductoModel.getEstadisticas();

            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

module.exports = ProductoController;