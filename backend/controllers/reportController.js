const { sql, config } = require('../db');

const obtenerReporteFiltrado = async (req, res) => {
    const { linea, periodo, equipoEspecifico } = req.query;

    let query = `SELECT * FROM vw_ReporteTMExpandido WHERE 1=1`;
    const conditions = [];

    if (linea) {
        conditions.push(`Linea = @Linea`);
    }

    if (periodo) {
        conditions.push(`Periodo = @Periodo`);
    }

    if (equipoEspecifico) {
        conditions.push(`EquipoEspecifico = @EquipoEspecifico`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    try {
        await sql.connect(config);
        const request = new sql.Request();

        if (linea) request.input('Linea', sql.VarChar, linea);
        if (periodo) request.input('Periodo', sql.Int, parseInt(periodo));
        if (equipoEspecifico) request.input('EquipoEspecifico', sql.VarChar, equipoEspecifico);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar los datos' });
    } finally {
        await sql.close();
    }
};

module.exports = { obtenerReporteFiltrado };