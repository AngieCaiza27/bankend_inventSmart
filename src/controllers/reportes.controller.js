const Reportes = require('../models/reportes.model');

// 1️⃣ Reporte de ventas
exports.reporteVentas = async (req, res) => {
  try {
    const datos = await Reportes.obtenerReporteVentas();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reporte de ventas', error: error.message });
  }
};

// 2️⃣ Reporte de stock actual
exports.reporteStock = async (req, res) => {
  try {
    const datos = await Reportes.obtenerReporteStock();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar reporte de stock', error: error.message });
  }
};

// 3️⃣ Productos próximos a agotarse
exports.productosAgotados = async (req, res) => {
  try {
    const datos = await Reportes.obtenerProductosAgotados();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos próximos a agotarse', error: error.message });
  }
};

// 4️⃣ Tendencias (para gráficos)
exports.tendenciasVentas = async (req, res) => {
  try {
    const datos = await Reportes.obtenerTendenciasVentas();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tendencias', error: error.message });
  }
};

// 5️⃣ Estadísticas generales
exports.estadisticasGenerales = async (req, res) => {
  try {
    const datos = await Reportes.obtenerEstadisticasGenerales();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};
