const Ventas = require('../models/ventas.model');

/*exports.registrarVenta = async (req, res) => {
  try {
    const { producto_id, unidades, usuario_id } = req.body;

    if (!producto_id || !unidades || !usuario_id) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const ventaId = await Ventas.registrarVenta(producto_id, unidades, usuario_id);

    res.status(201).json({
      message: 'Venta registrada con éxito',
      venta_id: ventaId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar venta' });
  }
};
*/
exports.registrarVentaCarrito = async (req, res) => {
  try {
    const { usuario_id, productos } = req.body;

    if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const ventaId = await Ventas.registrarVentaCarrito(usuario_id, productos);

    res.status(201).json({
      success: true,
      venta_id: ventaId
    });

  } catch (error) {
    console.error("❌ Error en registrarVentaCarrito:", error);
    res.status(500).json({
      message: 'Error al registrar la venta',
      error: error.message
    });
  }
};

// 🧾 Historial general de ventas
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

// Detalle por producto
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

// Total de ventas generales
exports.totalVentas = async (req, res) => {
  try {
    const total = await Ventas.obtenerTotalVentas();
    res.json({ success: true, data: total });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener total de ventas',
      error: error.message
    });
  }
};

// Total de ventas hoy
exports.totalVentasHoy = async (req, res) => {
  try {
    const total = await Ventas.obtenerTotalVentasHoy();
    res.json({ success: true, data: total });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener total de ventas hoy',
      error: error.message
    });
  }
};

