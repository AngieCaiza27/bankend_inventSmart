const { pool } = require('../config/database');

// 1️⃣ Reporte general de ventas
exports.obtenerReporteVentas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      v.id,
      v.fecha,
      p.nombre AS producto,
      v.unidades,
      v.total,
      u.nombre AS usuario
    FROM ventas v
    INNER JOIN productos p ON v.producto_id = p.id
    INNER JOIN usuarios u ON v.usuario_id = u.id
    ORDER BY v.fecha DESC
  `);
  return rows;
};

// 2️⃣ Reporte de stock actual (desde historial_stock)
exports.obtenerReporteStock = async () => {
  const [rows] = await pool.query(`
    SELECT 
      h.id,
      p.nombre AS producto,
      h.cambio,
      h.motivo,
      h.fecha
    FROM historial_stock h
    INNER JOIN productos p ON h.producto_id = p.id
    ORDER BY h.fecha DESC
  `);
  return rows;
};

// 3️⃣ Productos próximos a agotarse (stock <= stock_minimo)
exports.obtenerProductosAgotados = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id,
      nombre,
      stock,
      stock_minimo
    FROM productos
    WHERE stock <= stock_minimo
    ORDER BY stock ASC
  `);
  return rows;
};

// 4️⃣ Datos para gráficos de tendencias (ventas por día)
exports.obtenerTendenciasVentas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      DATE(fecha) AS fecha,
      SUM(total) AS total_diario,
      SUM(unidades) AS unidades_vendidas
    FROM ventas
    GROUP BY DATE(fecha)
    ORDER BY fecha ASC
  `);
  return rows;
};

// 5️⃣ Estadísticas generales
exports.obtenerEstadisticasGenerales = async () => {
  const [[totales]] = await pool.query(`
    SELECT 
      COUNT(v.id) AS total_ventas,
      SUM(v.total) AS monto_total,
      SUM(v.unidades) AS unidades_totales
    FROM ventas v
  `);

  const [[productos]] = await pool.query(`
    SELECT 
      COUNT(id) AS total_productos,
      SUM(stock) AS stock_total
    FROM productos
  `);

  return {
    ...totales,
    ...productos
  };
};
