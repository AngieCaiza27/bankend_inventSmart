CREATE DATABASE inventariosmart_db;
USE inventariosmart_db;
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla: Proveedores
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla intermedia: Proveedor_Categoría (Muchos a Muchos)
CREATE TABLE proveedor_categoria (
    id_proveedor INT,
    id_categoria INT,
    estado BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_proveedor, id_categoria),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id),
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- Tabla: Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT,
    proveedor_id INT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla: Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'empleado') NOT NULL,
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla: Ventas
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    unidades INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla: Reportes
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    tipo_reporte VARCHAR(100),
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

-- Tabla: Historial de cambios de stock
CREATE TABLE historial_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    cambio INT NOT NULL, -- puede ser negativo o positivo
    motivo VARCHAR(255),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
