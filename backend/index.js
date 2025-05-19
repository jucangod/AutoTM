const express = require('express');
const cors = require('cors');
const { sql, config } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conectamos la nueva ruta
const reporteRoutes = require('./routes/report');
app.use('/api/report', reporteRoutes);

// Devuelve los datos guardados en la tabla ReporteTM
app.get('/api/reporte', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM dbo.vw_ReporteTMExpandido');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al consultar la BD:', err);
    res.status(500).json({ error: 'Error al consultar los datos' });
  } finally {
    await sql.close();
  }
});

// Ejecuta el stored procedure InsertarReporteTM con fechas
app.post('/api/insertar-reporte', async (req, res) => {
  const { fechaInicio, fechaFin } = req.body;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Faltan fechas' });
  }

  try {
    await sql.connect(config);
    const request = new sql.Request();
    request.input('FechaInicio', sql.DateTime, fechaInicio);
    request.input('FechaFin', sql.DateTime, fechaFin);
    await request.execute('InsertarReporteTM');
    res.json({ message: 'Datos insertados correctamente' });
  } catch (err) {
    console.error('Error al insertar:', err);
    res.status(500).json({ error: 'Error al insertar datos' });
  } finally {
    await sql.close();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});