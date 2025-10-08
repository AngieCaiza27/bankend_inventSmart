// src/controllers/categoria.controller.js
const CategoriaModel = require('../models/categoria.model');

class CategoriaController {
    // Crear categoría
    static async create(req, res) {
        try {
            const { nombre, descripcion } = req.body;

            // Validar campo requerido
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la categoría es obligatorio'
                });
            }

            // Verificar si el nombre ya existe
            const existeNombre = await CategoriaModel.nameExists(nombre);
            if (existeNombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }

            // Crear categoría
            const categoriaId = await CategoriaModel.create({ nombre, descripcion });

            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: {
                    id: categoriaId,
                    nombre,
                    descripcion
                }
            });
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear categoría',
                error: error.message
            });
        }
    }

    // Obtener todas las categorías
    static async getAll(req, res) {
        try {
            const categorias = await CategoriaModel.findAll();

            res.json({
                success: true,
                data: categorias,
                total: categorias.length
            });
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener categorías',
                error: error.message
            });
        }
    }

    // Obtener categoría por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const categoria = await CategoriaModel.findById(id);

            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Obtener cantidad de productos
            const cantidadProductos = await CategoriaModel.countProducts(id);

            res.json({
                success: true,
                data: {
                    ...categoria,
                    cantidadProductos
                }
            });
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener categoría',
                error: error.message
            });
        }
    }

    // Actualizar categoría
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion } = req.body;

            // Verificar que la categoría existe
            const categoriaExiste = await CategoriaModel.findById(id);
            if (!categoriaExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Validar campo requerido
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la categoría es obligatorio'
                });
            }

            // Verificar si el nombre ya existe en otra categoría
            const existeNombre = await CategoriaModel.nameExists(nombre, id);
            if (existeNombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otra categoría con ese nombre'
                });
            }

            // Actualizar categoría
            await CategoriaModel.update(id, { nombre, descripcion });

            res.json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                data: {
                    id: parseInt(id),
                    nombre,
                    descripcion
                }
            });
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar categoría',
                error: error.message
            });
        }
    }

    // Eliminar categoría
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar que la categoría existe
            const categoria = await CategoriaModel.findById(id);
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Verificar si tiene productos asociados
            const tieneProductos = await CategoriaModel.hasProducts(id);
            if (tieneProductos) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar la categoría porque tiene productos asociados'
                });
            }

            // Eliminar categoría
            await CategoriaModel.delete(id);

            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar categoría',
                error: error.message
            });
        }
    }
}

module.exports = CategoriaController;