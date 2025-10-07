// src/app.js
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API InventSmart funcionando correctamente',
    version: '1.0.0'
  });
});

// Rutas de la API 
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/usuarios', require('./routes/usuarios.routes'));
// app.use('/api/productos', require('./routes/productos.routes'));
// app.use('/api/proveedores', require('./routes/proveedores.routes'));
// app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
// app.use('/api/reportes', require('./routes/reportes.routes'));

// Middlewares de error (deben ir al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;