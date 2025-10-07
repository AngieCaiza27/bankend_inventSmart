const Ventas = require('../models/ventas.model');

exports.registrarVenta = async (req, res) => {
  try {
    console.log('📦 Datos recibidos:', req.body);

    const { producto_id, unidades, usuario_id } = req.body;


    if (!producto_id || !unidades || !usuario_id) {
      return res.status(400).json({ message: 'Faltan datos para registrar la venta' });
    }


    const ventaId = await Ventas.registrarVenta(producto_id, unidades, usuario_id);


    await Ventas.actualizarStock(producto_id, unidades);


    await Ventas.registrarHistorialStock(producto_id, unidades, 'Venta realizada');


    res.status(201).json({
      message: 'Venta registrada con éxito',
      venta_id: ventaId,
    });

  } catch (error) {
    console.error('❌ Error en registrarVenta:', error);
    res.status(500).json({
      message: 'Error al registrar venta',
      error: error.message,
    });
  }
};

exports.historialVentas = async (req, res) => {
  try {
    const resultados = await Ventas.obtenerHistorial();
    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

exports.detallePorProducto = async (req, res) => {
  try {
    const productoId = req.params.id;
    const resultados = await Ventas.obtenerDetallePorProducto(productoId);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener detalle',
      error: error.message,
    });
  }
};
