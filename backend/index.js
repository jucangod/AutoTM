const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/reporte', (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Faltan parámetros de fecha' });
  }

  const comando = `twschema.ReporteTM '${fechaInicio}', '${fechaFin}'`;

  exec(comando, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ salida: stdout });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});