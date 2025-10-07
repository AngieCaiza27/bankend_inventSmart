const { pool } = require('../config/database');

exports.registrarVenta = async (producto_id, unidades, usuario_id) => {
  const [producto] = await pool.promise().query('SELECT precio, stock FROM productos WHERE id = ?', [producto_id]);
  if (!producto.length) throw new Error('Producto no encontrado');

  const { precio, stock } = producto[0];
  if (stock < unidades) throw new Error('Stock insuficiente');

  const total = precio * unidades;

  const [result] = await pool.promise().query(
    'INSERT INTO ventas (producto_id, unidades, total, usuario_id) VALUES (?, ?, ?, ?)',
    [producto_id, unidades, total, usuario_id]
  );

  return result.insertId;
};

exports.actualizarStock = async (producto_id, unidades) => {
  await pool.promise().query('UPDATE productos SET stock = stock - ? WHERE id = ?', [unidades, producto_id]);
};

exports.registrarHistorialStock = async (producto_id, cambio, motivo) => {
  await pool.promise().query(
    'INSERT INTO historial_stock (producto_id, cambio, motivo) VALUES (?, ?, ?)',
    [producto_id, -Math.abs(cambio), motivo]
  );
};

exports.obtenerHistorial = async () => {
  const [rows] = await pool.promise().query(`
    SELECT h.id, p.id AS producto_id, p.precio, h.fecha, h.cambio, h.motivo
    FROM historial_stock h
    INNER JOIN productos p ON h.producto_id = p.id
    ORDER BY h.fecha DESC
  `);
  return rows;
};

exports.obtenerDetallePorProducto = async (producto_id) => {
  const [rows] = await pool.promise().query(`
    SELECT v.id, v.unidades, v.total, v.fecha, u.nombre AS usuario
    FROM ventas v
    INNER JOIN usuarios u ON v.usuario_id = u.id
    WHERE v.producto_id = ?
    ORDER BY v.fecha DESC
  `, [producto_id]);
  return rows;
};
