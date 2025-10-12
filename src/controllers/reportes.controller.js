const Reportes = require('../models/reportes.model');

//  Reporte de ventas
exports.reporteVentas = async (req, res) => {
  try {
    const datos = await Reportes.obtenerReporteVentas();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reporte de ventas', error: error.message });
  }
};

//  Reporte de stock actual
exports.reporteStock = async (req, res) => {
  try {
    const datos = await Reportes.obtenerReporteStock();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reporte de stock', error: error.message });
  }
};

// Productos próximos a agotarse
exports.productosAgotados = async (req, res) => {
  try {
    const datos = await Reportes.obtenerProductosAgotados();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos próximos a agotarse', error: error.message });
  }
};

//  Tendencias (para gráficos)
exports.tendenciasVentas = async (req, res) => {
  try {
    const datos = await Reportes.obtenerTendenciasVentas();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tendencias', error: error.message });
  }
};

//  Estadísticas generales
exports.estadisticasGenerales = async (req, res) => {
  try {
    const datos = await Reportes.obtenerEstadisticasGenerales();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};
// Conteo de proveedores
exports.conteoProveedores = async (req, res) => {
  try {
    const datos = await Reportes.obtenerConteoProveedores();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener conteo de proveedores', error: error.message });
  }
};

// Ventas del mes actual
exports.ventasMesActual = async (req, res) => {
  try {
    const datos = await Reportes.obtenerVentasMesActual();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas del mes actual', error: error.message });
  }
};

// Ventas por categoría
exports.ventasPorCategoria = async (req, res) => {
  try {
    const datos = await Reportes.obtenerVentasPorCategoria();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas por categoría', error: error.message });
  }
};

//  Tendencias mensuales
exports.tendenciasMensuales = async (req, res) => {
  try {
    const datos = await Reportes.obtenerTendenciasMensuales();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tendencias mensuales', error: error.message });
  }
};

exports.stockOverview = async (req, res) => {
  try {
    const datos = await Reportes.obtenerStockOverview();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener stock overview', 
      error: error.message 
    });
  }
};

// Stock por categoría (gráfico circular)
exports.stockPorCategoria = async (req, res) => {
  try {
    const datos = await Reportes.obtenerStockPorCategoria();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener stock por categoría', 
      error: error.message 
    });
  }
};

// Historial de producto (opcional)
exports.historialProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { dias } = req.query;
    const datos = await Reportes.obtenerHistorialProducto(id, dias);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener historial del producto', 
      error: error.message 
    });
  }
};
