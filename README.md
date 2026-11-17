# 📦 InventSmart - Backend API

API RESTful para la gestión integral de inventarios, control de stock, proveedores, categorías, ventas y generación de reportes con autenticación basada en roles (JWT).

---

## 🚀 Tecnologías Principales

- **Entorno de Ejecución:** [Node.js](https://nodejs.org/) (v16+)
- **Framework Web:** [Express.js](https://expressjs.com/) v5
- **Base de Datos:** [MySQL](https://www.mysql.com/) con el driver `mysql2` (Connection Pool)
- **Seguridad y Criptografía:** `jsonwebtoken` (JWT) y `bcryptjs`
- **Servicio de Correos:** `@sendgrid/mail` / `nodemailer` (Recuperación de contraseñas)
- **Variables de Entorno:** `dotenv`

---

## 📁 Estructura del Proyecto

```text
bankend_inventSmart/
├── BD_INVSMART.sql         # Script SQL de creación de base de datos y tablas
├── sql.mwb                 # Modelo entidad-relación en MySQL Workbench
├── ROUTES.md               # Especificación exhaustiva de endpoints
├── index.js                # Punto de entrada y arranque del servidor HTTP
├── package.json            # Dependencias y scripts del proyecto
├── .env.example            # Plantilla de variables de entorno requeridas
└── src/
    ├── app.js              # Configuración de Express, middlewares y montaje de rutas
    ├── config/
    │   ├── database.js     # Pool de conexiones a MySQL
    │   └── email.config.js # Configuración de SendGrid para correos
    ├── controllers/        # Lógica de negocio por módulo
    │   ├── auth.controller.js
    │   ├── categoria.controller.js
    │   ├── producto.controller.js
    │   ├── proveedor.controller.js
    │   ├── reportes.controller.js
    │   └── ventas.controller.js
    ├── middlewares/        # Middlewares de autenticación (JWT, roles) y errores
    │   ├── auth.js
    │   └── errorHandler.js
    ├── models/             # Consultas SQL e interacción con la base de datos
    │   ├── categoria.model.js
    │   ├── producto.model.js
    │   ├── proveedor.model.js
    │   ├── reportes.model.js
    │   ├── usuario.model.js
    │   └── ventas.model.js
    ├── routes/             # Definición de rutas y asignación de middlewares
    │   ├── auth.routes.js
    │   ├── categorias.routes.js
    │   ├── producto.routes.js
    │   ├── proveedor.routes.js
    │   ├── reportes.routes.js
    │   └── ventas.routes.js
    └── utils/
        └── seedAdmin.js    # Script para crear el usuario administrador inicial
```

---

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/)
- Servidor de base de datos [MySQL](https://dev.mysql.com/downloads/) activo
- Cuenta de [SendGrid](https://sendgrid.com/) (opcional para el flujo de emails de recuperación de contraseña)

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio e ingresar a la carpeta
```bash
git clone <URL_DEL_REPOSITORIO>
cd bankend_inventSmart
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la Base de Datos
Importa el script SQL `BD_INVSMART.sql` en tu gestor de base de datos MySQL (por ejemplo MySQL Workbench, phpMyAdmin o terminal):

```bash
mysql -u root -p < BD_INVSMART.sql
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`:

```env
PORT=3000
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inventariosmart_db
DB_PORT=3306

# Autenticación JWT
JWT_SECRET=tu_secreto_super_seguro_jwt
JWT_EXPIRES_IN=24h

# Servicio de Correo (SendGrid)
SENDGRID_API_KEY=tu_api_key_de_sendgrid
EMAIL_FROM=no-reply@tudominio.com
EMAIL_FROM_NAME="InventSmart"
```

### 5. Crear Usuario Administrador Inicial
Ejecuta el script seeder para generar las credenciales del primer usuario admin:

```bash
npm run seed:admin
```
> **Credenciales generadas por defecto:**
> - **Correo:** `admin@inventsmart.com`
> - **Contraseña:** `admin123`
> *(Se recomienda cambiar la contraseña tras el primer inicio de sesión).*

---

## ▶️ Ejecución del Proyecto

- **Modo Desarrollo (con recarga automática mediante Nodemon):**
  ```bash
  npm run dev
  ```
- **Modo Producción:**
  ```bash
  npm start
  ```

El servidor estará accesible en `http://localhost:3000`.

---

## 📚 Resumen de Endpoints de la API

Para consultar el detalle completo de parámetros, encabezados y respuestas, revisa el archivo [ROUTES.md](ROUTES.md).

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Inicio de sesión (devuelve token JWT) |
| `POST` | `/api/auth/register` | Público | Registro de nuevos usuarios |
| `POST` | `/api/auth/forgot-password` | Público | Envío de código de recuperación por correo |
| `POST` | `/api/auth/reset-password` | Público | Restablecer contraseña con código |
| `GET` | `/api/auth/profile` | Autenticado | Obtener perfil del usuario actual |
| `PUT` | `/api/auth/change-password` | Autenticado | Cambiar contraseña del usuario |

### 📦 Productos (`/api/productos`)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/productos` | Empleado / Admin | Listar productos |
| `GET` | `/api/productos/search?q=...` | Empleado / Admin | Búsqueda por término |
| `GET` | `/api/productos/stock-bajo` | Empleado / Admin | Listar alertas de stock crítico |
| `GET` | `/api/productos/estadisticas` | Empleado / Admin | Métricas generales de inventario |
| `GET` | `/api/productos/:id` | Empleado / Admin | Detalle de un producto |
| `GET` | `/api/productos/:id/historial` | Empleado / Admin | Historial de movimientos de stock |
| `POST` | `/api/productos` | Solo Admin | Crear producto |
| `PUT` | `/api/productos/:id` | Solo Admin | Actualizar producto |
| `PATCH` | `/api/productos/:id/stock` | Solo Admin | Ajustar unidades de stock |
| `PATCH` | `/api/productos/:id/status` | Solo Admin | Activar/desactivar producto |
| `DELETE` | `/api/productos/:id` | Solo Admin | Eliminar producto |

### 🏢 Proveedores (`/api/proveedores`)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/proveedores` | Empleado / Admin | Listar proveedores activos |
| `GET` | `/api/proveedores/count` | Empleado / Admin | Conteo total de proveedores |
| `GET` | `/api/proveedores/:id` | Empleado / Admin | Obtener proveedor por ID |
| `GET` | `/api/proveedores/:id/categorias` | Empleado / Admin | Categorías asociadas a un proveedor |
| `POST` | `/api/proveedores` | Solo Admin | Registrar proveedor |
| `PUT` | `/api/proveedores/:id` | Solo Admin | Modificar datos de proveedor |
| `PUT` | `/api/proveedores/:id/status` | Solo Admin | Alternar estado activo/inactivo |
| `DELETE` | `/api/proveedores/:id` | Solo Admin | Eliminar proveedor |

### 🏷️ Categorías (`/api/categorias`)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/categorias` | Empleado / Admin | Listar categorías |
| `GET` | `/api/categorias/:id` | Empleado / Admin | Obtener categoría por ID |
| `POST` | `/api/categorias` | Solo Admin | Registrar nueva categoría |
| `PUT` | `/api/categorias/:id` | Solo Admin | Modificar categoría |
| `DELETE` | `/api/categorias/:id` | Solo Admin | Eliminar categoría |

### 💰 Ventas (`/api/ventas`)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `POST` | `/api/ventas` | Empleado / Admin | Registrar venta con deducción atómica de stock |
| `GET` | `/api/ventas` | Empleado / Admin | Historial general de ventas |
| `GET` | `/api/ventas/:id` | Empleado / Admin | Detalle de venta y sus items |

### 📊 Reportes (`/api/reportes`)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/api/reportes/proveedores-count` | Empleado / Admin | Conteo de proveedores |
| `GET` | `/api/reportes/ventas-mes` | Empleado / Admin | Reporte de ventas del mes |
| `GET` | `/api/reportes/ventas-categoria` | Empleado / Admin | Distribución de ventas por categoría |
| `GET` | `/api/reportes/tendencias-mensuales` | Empleado / Admin | Tendencias comparativas mensuales |

---

## 🔒 Manejo de Autenticación en Requests

Para las rutas protegidas, incluye el token en el header `Authorization`:

```http
Authorization: Bearer <TU_JWT_TOKEN>
```
