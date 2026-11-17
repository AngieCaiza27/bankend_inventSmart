// server.js
require('dotenv').config(); // Cargar variables del archivo .env
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor y verificar conexión DB
const startServer = async () => {
  try {
    // 1. Verificar conexión a la base de datos
    await testConnection(); // Esto viene del pool.promise()

    // 2. Iniciar el servidor Express
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📝 Modo: ${process.env.NODE_ENV}`);
      console.log(`🌐 URL Local: http://localhost:${PORT}`);
      console.log(`🌐 URL Red: http://192.168.1.27:${PORT}`);
    });


  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1); // Salir con error
  }
};

// Iniciar el servidor
startServer();
