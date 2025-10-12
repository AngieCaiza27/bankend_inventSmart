const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');



















router.get('/ventas', reportesController.reporteVentas);
router.get('/stock', reportesController.reporteStock);
router.get('/productos-agotados', reportesController.productosAgotados);
router.get('/tendencias', reportesController.tendenciasVentas);
router.get('/estadisticas', reportesController.estadisticasGenerales);

router.get('/proveedores', reportesController.conteoProveedores);
router.get('/ventas-mes', reportesController.ventasMesActual);
router.get('/ventas-categoria', reportesController.ventasPorCategoria);
router.get('/tendencias-mensuales', reportesController.tendenciasMensuales);



module.exports = router;
