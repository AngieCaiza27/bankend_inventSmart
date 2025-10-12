const { pool } = require('../config/database');

//  Registrar una venta
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

  // Iniciar transacción para asegurar consistencia
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar la venta
    const [result] = await connection.query(
      'INSERT INTO ventas (producto_id, unidades, total, usuario_id) VALUES (?, ?, ?, ?)',
      [producto_id, unidades, total, usuario_id]
    );

    // Actualizar stock del producto
    await connection.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [unidades, producto_id]
    );

    // Registrar movimiento en historial_stock
    await connection.query(
      `INSERT INTO historial_stock (producto_id, cambio, motivo) VALUES (?, ?, ?)`,
      [producto_id, -unidades, 'Venta de realizada']
    );

    // Confirmar transacción
    await connection.commit();

    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
//  Obtener historial general de ventas (todas las ventas)
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

// Obtener detalle de ventas por producto
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
