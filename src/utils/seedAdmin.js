// src/utils/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createAdminUser() {
    try {
        // Verificar si ya existe un admin
        const [existingAdmin] = await pool.execute(
            'SELECT * FROM usuarios WHERE correo = ?',
            ['admin@inventsmart.com']
        );

        if (existingAdmin.length > 0) {
            console.log('⚠️  Usuario administrador ya existe');
            process.exit(0);
        }

        // Crear contraseña encriptada
        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash('admin123', salt);

        // Insertar usuario admin
        await pool.execute(
            'INSERT INTO usuarios (nombre, correo, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?)',
            ['Administrador', 'admin@inventsmart.com', contrasenaHash, 'admin', true]
        );

        console.log('✅ Usuario administrador creado exitosamente');
        console.log('📧 Correo: admin@inventsmart.com');
        console.log('🔑 Contraseña: admin123');
        console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error);
        process.exit(1);
    }
}

createAdminUser();