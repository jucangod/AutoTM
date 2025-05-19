const express = require('express');
const router = express.Router();
const { obtenerReporteFiltrado } = require('../controllers/reportController');

// Ruta GET con posibles filtros por query params
router.get('/', obtenerReporteFiltrado);

module.exports = router;