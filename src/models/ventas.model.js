const { pool } = require('../config/database');

// 1️⃣ Registrar una venta
exports.registrarVenta = async (producto_id, unidades, usuario_id) => {
  // Buscar el producto y su stock
  const [producto] = await pool.query(
    'SELECT precio, stock FROM productos WHERE id = ?',
    [producto_id]
  );

  if (!producto.length) throw new Error('Producto no encontrado');

  const { precio, stock } = producto[0];
  if (stock < unidades) throw new Error('Stock insuficiente');

  // Calcular total
  const total = precio * unidades;

  // Insertar la venta
  const [result] = await pool.query(
    'INSERT INTO ventas (producto_id, unidades, total, usuario_id) VALUES (?, ?, ?, ?)',
    [producto_id, unidades, total, usuario_id]
  );

  return result.insertId;
};

// 2️⃣ Actualizar stock después de la venta
exports.actualizarStock = async (producto_id, unidades) => {
  await pool.query(
    'UPDATE productos SET stock = stock - ? WHERE id = ?',
    [unidades, producto_id]
  );
};

// 3️⃣ Obtener historial general de ventas (todas las ventas)
exports.obtenerHistorial = async () => {
  const [rows] = await pool.query(`
    SELECT 
      v.id,
      v.fecha,
      p.id,
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

// 4️⃣ Obtener detalle de ventas por producto
exports.obtenerDetallePorProducto = async (producto_id) => {
  const [rows] = await pool.query(`
    SELECT 
      v.id,
      v.fecha,
      v.unidades,
      v.total,
      u.nombre AS usuario
    FROM ventas v
    INNER JOIN usuarios u ON v.usuario_id = u.id
    WHERE v.producto_id = ?
    ORDER BY v.fecha DESC
  `, [producto_id]);

  return rows;
};
