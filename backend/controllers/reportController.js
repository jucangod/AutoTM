const { sql, config } = require('../db');

const obtenerReporteFiltrado = async (req, res) => {
    const { linea, periodo, equipo } = req.query;

    let query = `SELECT * FROM vw_ReporteTMExpandido WHERE 1=1`;
    const conditions = [];

    if (linea) {
        conditions.push(`Linea = @Linea`);
    }

    if (periodo) {
        conditions.push(`Periodo = @Periodo`);
    }

    if (equipo) {
        conditions.push(`Equipo = @EquipoEspecifico`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    try {
        await sql.connect(config);
        const request = new sql.Request();
        
        if (linea) request.input('Linea', sql.VarChar, linea);
        if (periodo) request.input('Periodo', sql.Int, parseInt(periodo)); 
        if (equipo) request.input('EquipoEspecifico', sql.VarChar, equipo);

        const result = await request.query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar la BD:', err);
        res.status(500).json({ error: 'Error al consultar los datos' });
    } finally {
        await sql.close();
    }
};

module.exports = { obtenerReporteFiltrado };