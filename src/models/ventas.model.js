const { pool } = require('../config/database');

//*/  Registrar una venta
/*exports.registrarVenta = async (producto_id, unidades, usuario_id) => {
  const connection = await pool.getConnection();

  try {
    const [producto] = await connection.query(
      'SELECT precio, stock FROM productos WHERE id = ?',
      [producto_id]
    );

    if (!producto.length) throw new Error('Producto no encontrado');
    if (producto[0].stock < unidades) throw new Error('Stock insuficiente');

    const total = producto[0].precio * unidades;

    await connection.beginTransaction();

    // ✅ 1. Registrar venta
    const [venta] = await connection.query(
      'INSERT INTO ventas (producto_id, unidades, total, usuario_id) VALUES (?, ?, ?, ?)',
      [producto_id, unidades, total, usuario_id]
    );

    // ✅ 2. Actualizar stock
    await connection.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [unidades, producto_id]
    );

    // ✅ 3. UN SOLO HISTORIAL
    await connection.query(
      'INSERT INTO historial_stock (producto_id, cambio, motivo) VALUES (?, ?, ?)',
      [producto_id, -unidades, `Venta ID: ${venta.insertId}`]
    );

    await connection.commit();
    return venta.insertId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
*/
exports.registrarVentaCarrito = async (usuario_id, productos) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let ventaIdGlobal = null;

    for (const item of productos) {
      const { producto_id, unidades } = item;

      const [producto] = await connection.query(
        'SELECT precio, stock FROM productos WHERE id = ?',
        [producto_id]
      );

      if (!producto.length) throw new Error('Producto no existe');
      if (producto[0].stock < unidades) {
        throw new Error('Stock insuficiente');
      }

      const total = producto[0].precio * unidades;

      // ✅ SOLO UNA VENTA GENERAL
      if (!ventaIdGlobal) {
        const [venta] = await connection.query(
          'INSERT INTO ventas (producto_id, unidades, total, usuario_id) VALUES (?, ?, ?, ?)',
          [producto_id, unidades, total, usuario_id]
        );
        ventaIdGlobal = venta.insertId;
      }

      // ✅ ACTUALIZAR STOCK (UNA VEZ)
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [unidades, producto_id]
      );

      // ✅ HISTORIAL ÚNICO POR PRODUCTO
      await connection.query(
        `INSERT INTO historial_stock (producto_id, cambio, motivo)
         SELECT ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM historial_stock 
           WHERE producto_id = ? AND motivo = ?
         )`,
        [
          producto_id,
          -unidades,
          `Venta ID: ${ventaIdGlobal}`,
          producto_id,
          `Venta ID: ${ventaIdGlobal}`
        ]
      );
    }

    await connection.commit();
    return ventaIdGlobal;

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

// Obtener total de ventas acumulado
exports.obtenerTotalVentas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      SUM(total) AS total_ventas,
      COUNT(*) AS total_registros
    FROM ventas
  `);
  return rows[0]; // { total_ventas: 1234.50, total_registros: 50 }
};

// Opcional: total de ventas por día
exports.obtenerTotalVentasHoy = async () => {
  const [rows] = await pool.query(`
    SELECT 
      SUM(total) AS total_hoy,
      COUNT(*) AS ventas_hoy
    FROM ventas
    WHERE DATE(fecha) = CURDATE()
  `);
  return rows[0];
};

