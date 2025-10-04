// server.js
require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        await testConnection();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📝 Modo: ${process.env.NODE_ENV}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();