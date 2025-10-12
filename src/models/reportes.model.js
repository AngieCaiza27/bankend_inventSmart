const { pool } = require('../config/database');

//  Reporte general de ventas
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

//  Reporte de stock actual (desde historial_stock)
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

// Productos próximos a agotarse (stock <= stock_minimo)
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

// Datos para gráficos de tendencias (ventas por día)
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

// Estadísticas generales
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
// Conteo de proveedores
exports.obtenerConteoProveedores = async () => {
  const [[result]] = await pool.query(`
    SELECT COUNT(id) AS total_proveedores
    FROM proveedores
    WHERE estado = TRUE
  `);
  return result;
};

// Ventas del mes actual
exports.obtenerVentasMesActual = async () => {
  const [rows] = await pool.query(`
    SELECT 
      v.id,
      DATE(v.fecha) AS fecha,
      p.nombre AS producto,
      c.nombre AS categoria,
      v.unidades,
      v.total,
      u.nombre AS usuario
    FROM ventas v
    INNER JOIN productos p ON v.producto_id = p.id
    INNER JOIN categorias c ON p.categoria_id = c.id
    INNER JOIN usuarios u ON v.usuario_id = u.id
    WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE())
      AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
    ORDER BY v.fecha DESC
  `);
  return rows;
};

// Ventas por categoría
exports.obtenerVentasPorCategoria = async () => {
  const [rows] = await pool.query(`
    SELECT 
      c.nombre AS categoria,
      SUM(v.unidades) AS unidades_vendidas,
      SUM(v.total) AS total_vendido
    FROM ventas v
    INNER JOIN productos p ON v.producto_id = p.id
    INNER JOIN categorias c ON p.categoria_id = c.id
    GROUP BY c.nombre
    ORDER BY total_vendido DESC
  `);
  return rows;
};

// Tendencias mensuales (para agrupar por mes)
exports.obtenerTendenciasMensuales = async () => {
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(v.fecha, '%Y-%m') AS mes,
      SUM(v.total) AS total_mensual,
      SUM(v.unidades) AS unidades_vendidas
    FROM ventas v
    GROUP BY DATE_FORMAT(v.fecha, '%Y-%m')
    ORDER BY mes ASC
  `);
  return rows;
};

