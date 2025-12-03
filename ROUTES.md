# Documentación de Rutas API - InventSmart

Esta documentación contiene todas las rutas disponibles en la rama `pruebaBackend` del proyecto InventSmart.

## Ruta Base

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Verificar que la API está funcionando correctamente |

---

## 🔐 Autenticación (`/api/auth`)

### Rutas Públicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/api/auth/reset-password` | Restablecer contraseña |

### Rutas Protegidas (requieren token)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/auth/profile` | Obtener perfil del usuario autenticado |
| PUT | `/api/auth/change-password` | Cambiar contraseña del usuario |

---

## 📦 Productos (`/api/productos`)

> Todas las rutas requieren autenticación (token)

### Rutas para usuarios autenticados (empleados y admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Obtener todos los productos |
| GET | `/api/productos/search` | Buscar productos |
| GET | `/api/productos/stock-bajo` | Obtener productos con stock bajo |
| GET | `/api/productos/estadisticas` | Obtener estadísticas de productos |
| GET | `/api/productos/:id` | Obtener producto por ID |
| GET | `/api/productos/:id/historial` | Obtener historial de stock de un producto |

### Rutas solo para administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/productos` | Crear nuevo producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| PATCH | `/api/productos/:id/stock` | Actualizar stock de producto |
| PATCH | `/api/productos/:id/status` | Cambiar estado de producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

---

## 🏢 Proveedores (`/api/proveedores`)

> Todas las rutas requieren autenticación (token)

### Rutas para usuarios autenticados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/proveedores` | Obtener todos los proveedores |
| GET | `/api/proveedores/count` | Contar proveedores |
| GET | `/api/proveedores/estadisticas` | Obtener estadísticas de proveedores |
| GET | `/api/proveedores/:id` | Obtener proveedor por ID |
| GET | `/api/proveedores/:id/categorias` | Obtener categorías de un proveedor |

### Rutas solo para administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/proveedores` | Crear nuevo proveedor |
| PUT | `/api/proveedores/:id` | Actualizar proveedor |
| PUT | `/api/proveedores/:id/status` | Cambiar estado de proveedor |
| DELETE | `/api/proveedores/:id` | Eliminar proveedor |

---

## 🏷️ Categorías (`/api/categorias`)

> Todas las rutas requieren autenticación (token)

### Rutas para usuarios autenticados (empleados y admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categorias` | Obtener todas las categorías |
| GET | `/api/categorias/:id` | Obtener categoría por ID |

### Rutas solo para administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/categorias` | Crear nueva categoría |
| PUT | `/api/categorias/:id` | Actualizar categoría |
| DELETE | `/api/categorias/:id` | Eliminar categoría |

---

## 💰 Ventas (`/api/ventas`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/ventas` | Registrar una venta |
| GET | `/api/ventas/historial` | Historial completo de ventas |
| GET | `/api/ventas/producto/:id` | Detalle de ventas por producto |

---

## 📊 Reportes (`/api/reportes`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reportes/ventas` | Reporte de ventas |
| GET | `/api/reportes/stock` | Reporte de stock |
| GET | `/api/reportes/productos-agotados` | Productos agotados |
| GET | `/api/reportes/tendencias` | Tendencias de ventas |
| GET | `/api/reportes/estadisticas` | Estadísticas generales |
| GET | `/api/reportes/proveedores` | Conteo de proveedores |
| GET | `/api/reportes/ventas-mes` | Ventas del mes actual |
| GET | `/api/reportes/ventas-categoria` | Ventas por categoría |
| GET | `/api/reportes/tendencias-mensuales` | Tendencias mensuales |
| GET | `/api/reportes/stock-overview` | Vista general de stock |
| GET | `/api/reportes/stock-por-categoria` | Stock por categoría |
| GET | `/api/reportes/historial-producto/:id` | Historial de un producto específico |

---

## Resumen de Rutas

| Módulo | Total de Rutas |
|--------|----------------|
| Autenticación | 6 |
| Productos | 11 |
| Proveedores | 9 |
| Categorías | 5 |
| Ventas | 3 |
| Reportes | 12 |
| Ruta base | 1 |
| **TOTAL** | **47** |

---

## Middlewares utilizados

- `verifyToken`: Verifica que el usuario tenga un token válido
- `isAdmin`: Verifica que el usuario tenga rol de administrador
- `notFound`: Maneja rutas no encontradas (404)
- `errorHandler`: Maneja errores generales de la API

---

*Documentación generada desde la rama `pruebaBackend`*
