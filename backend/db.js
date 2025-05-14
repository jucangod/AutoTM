const sql = require('mssql');
require('dotenv').config(); // Carga las variables de entorno

// Configuración de conexión a la base de datos
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
};

module.exports = { sql, config };