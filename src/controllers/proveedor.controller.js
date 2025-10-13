// src/controllers/proveedor.controller.js
const ProveedorModel = require('../models/proveedor.model');
const { pool } = require('../config/database');

class ProveedorController {
    // Crear proveedor
    static async create(req, res) {
        try {
            const { empresa, contacto, categorias } = req.body;

            // Validar campo requerido
            if (!empresa || empresa.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la empresa es obligatorio'
                });
            }

            // Verificar si la empresa ya existe
            const existeEmpresa = await ProveedorModel.empresaExists(empresa);
            if (existeEmpresa) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un proveedor con ese nombre de empresa'
                });
            }

            // Crear proveedor
            const proveedorId = await ProveedorModel.create({ empresa, contacto });
            console.log('✅ Proveedor creado con ID:', proveedorId);

            // Asignar categorías si se proporcionaron
            if (categorias && Array.isArray(categorias) && categorias.length > 0) {
                console.log('📦 Asignando categorías:', categorias);
                await ProveedorModel.updateCategories(proveedorId, categorias);
                console.log('✅ Categorías asignadas correctamente');
            }

            // Obtener proveedor con categorías
            const proveedor = await ProveedorModel.findByIdWithCategories(proveedorId);
            console.log('📋 Proveedor final:', proveedor);

            res.status(201).json({
                success: true,
                message: 'Proveedor creado exitosamente',
                data: proveedor
            });
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear proveedor',
                error: error.message
            });
        }
    }

    // Obtener todos los proveedores
    static async getAll(req, res) {
        try {
            const { includeInactive } = req.query;
            const proveedores = await ProveedorModel.findAll(includeInactive === 'true');

            // Obtener categorías para cada proveedor
            const proveedoresConCategorias = await Promise.all(
                proveedores.map(async (proveedor) => {
                    const categorias = await ProveedorModel.getCategories(proveedor.id);
                    const cantidadProductos = await ProveedorModel.countProducts(proveedor.id);
                    return {
                        ...proveedor,
                        categorias,
                        cantidadProductos
                    };
                })
            );

            res.json({
                success: true,
                data: proveedoresConCategorias,
                total: proveedoresConCategorias.length
            });
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proveedores',
                error: error.message
            });
        }
    }

    // Obtener proveedor por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const proveedor = await ProveedorModel.findByIdWithCategories(id);

            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Obtener cantidad de productos
            const cantidadProductos = await ProveedorModel.countProducts(id);

            res.json({
                success: true,
                data: {
                    ...proveedor,
                    cantidadProductos
                }
            });
        } catch (error) {
            console.error('Error al obtener proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener proveedor',
                error: error.message
            });
        }
    }

    // Actualizar proveedor
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { empresa, contacto, estado, categorias } = req.body;

            // Verificar que el proveedor existe
            const proveedorExiste = await ProveedorModel.findById(id);
            if (!proveedorExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Validar campo requerido
            if (!empresa || empresa.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la empresa es obligatorio'
                });
            }

            // Verificar si el nombre ya existe en otro proveedor
            const existeEmpresa = await ProveedorModel.empresaExists(empresa, id);
            if (existeEmpresa) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro proveedor con ese nombre de empresa'
                });
            }

            // Actualizar proveedor
            await ProveedorModel.update(id, {
                empresa,
                contacto,
                estado: estado !== undefined ? estado : proveedorExiste.estado
            });

            // Actualizar categorías si se proporcionaron
            if (categorias !== undefined) {
                if (Array.isArray(categorias)) {
                    await ProveedorModel.updateCategories(id, categorias);
                }
            }

            // Obtener proveedor actualizado
            const proveedorActualizado = await ProveedorModel.findByIdWithCategories(id);

            res.json({
                success: true,
                message: 'Proveedor actualizado exitosamente',
                data: proveedorActualizado
            });
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar proveedor',
                error: error.message
            });
        }
    }

    // Cambiar estado del proveedor
    static async changeStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Verificar que el proveedor existe
            const proveedor = await ProveedorModel.findById(id);
            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            if (estado === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado es obligatorio'
                });
            }

            await ProveedorModel.changeStatus(id, estado);

            res.json({
                success: true,
                message: `Proveedor ${estado ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar estado del proveedor',
                error: error.message
            });
        }
    }

    // Eliminar proveedor
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el proveedor existe
            const proveedor = await ProveedorModel.findById(id);
            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            // Verificar si tiene productos asociados
            const tieneProductos = await ProveedorModel.hasProducts(id);
            if (tieneProductos) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el proveedor porque tiene productos asociados'
                });
            }

            // Eliminar proveedor (esto también eliminará las relaciones en proveedor_categoria)
            await ProveedorModel.delete(id);

            res.json({
                success: true,
                message: 'Proveedor eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar proveedor',
                error: error.message
            });
        }
    }

    

static async delete(req, res) {
        const conn = await pool.getConnection();
        const id = Number(req.params?.id);

        try {
            if (!id || Number.isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            const proveedor = await ProveedorModel.findById(id);
            if (!proveedor) {
                return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
            }

            const tieneProductos = await ProveedorModel.hasProducts(id);
            if (tieneProductos) {
                // Conflicto: no se puede borrar porque hay referencias
                return res.status(409).json({
                    success: false,
                    code: 'HAS_PRODUCTS',
                    message: 'No se puede eliminar: el proveedor tiene productos asociados. Desactívelo.'
                });
            }

            await conn.beginTransaction();

            // borra pivot si no tienes ON DELETE CASCADE en proveedor_categoria
            await conn.execute('DELETE FROM proveedor_categoria WHERE id_proveedor = ?', [id]);

            // borra el proveedor
            const [result] = await conn.execute('DELETE FROM proveedores WHERE id = ?', [id]);

            await conn.commit();

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
            }

            return res.json({ success: true, message: 'Proveedor eliminado exitosamente' });

        } catch (error) {
            await conn.rollback();
            // 🔎 Logs útiles en consola para depurar rápido
            console.error('[DELETE proveedor] error:', {
                msg: error?.message,
                code: error?.code,
                errno: error?.errno,
                sqlState: error?.sqlState
            });

            // Mapea FK 1451 (ER_ROW_IS_REFERENCED_2) a 409
            if (error?.errno === 1451 || error?.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({
                    success: false,
                    code: 'HAS_DEPENDENCIES',
                    message: 'No se puede eliminar por dependencias (FK).'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error al eliminar proveedor',
                error: error?.message || 'Internal Server Error'
            });
        } finally {
            conn.release();
        }
    }


    // Obtener categorías de un proveedor
    static async getCategories(req, res) {
        try {
            const { id } = req.params;

            const proveedor = await ProveedorModel.findById(id);
            if (!proveedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }

            const categorias = await ProveedorModel.getCategories(id);

            res.json({
                success: true,
                data: categorias,
                total: categorias.length
            });
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener categorías del proveedor',
                error: error.message
            });
        }
    }

    // Contar proveedores
    static async count(req, res) {
        try {
            const { includeInactive } = req.query;
            const total = await ProveedorModel.countAll(includeInactive === 'true');

            res.json({
                success: true,
                data: {
                    total_proveedores: total
                }
            });
        } catch (error) {
            console.error('Error al contar proveedores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al contar proveedores',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de proveedores
    static async getEstadisticas(req, res) {
        try {
            const estadisticas = await ProveedorModel.getEstadisticas();

            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de proveedores',
                error: error.message
            });
        }
    }
}

module.exports = ProveedorController;