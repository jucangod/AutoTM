const { sql, config } = require('../db');

const obtenerReporteFiltrado = async (req, res) => {
    const { fechaInicio, linea, periodo, semana, equipoEspecifico, programado } = req.query;
    const { pagina = 1, limite = 100 } = req.query;
    const offset = (pagina - 1) * limite;


    let query = `SELECT * FROM vw_ReporteTMExpandido WHERE 1=1`;
    const conditions = [];

    if (linea) {
        conditions.push(`Linea = @Linea`);
    }

    if (periodo) {
        conditions.push(`Periodo = @Periodo`);
    }

    if (semana) {
        conditions.push(`Semana = @Semana`);
    }

    if (equipoEspecifico) {
        conditions.push(`EquipoEspecifico = @EquipoEspecifico`);
    }

    if (fechaInicio) {
        conditions.push(`CONVERT(date, FechaInicio) = @FechaInicio`);
    }

    if (programado !== undefined && programado !== null && programado !== '') {
        conditions.push(`Programado = @Programado`);
    }

    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    query += `
    ORDER BY FechaInicio
    OFFSET @offset ROWS
    FETCH NEXT @limite ROWS ONLY
    `;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        if (linea) request.input('Linea', sql.VarChar, linea);
        if (periodo) request.input('Periodo', sql.Int, parseInt(periodo));
        if (semana) request.input('Semana', sql.Int, parseInt(semana));
        if (equipoEspecifico) request.input('EquipoEspecifico', sql.VarChar, equipoEspecifico);
        if (fechaInicio) request.input('FechaInicio', sql.Date, new Date(fechaInicio));
        if (programado) request.input('Programado', sql.Bit, parseInt(programado));

        request.input('offset', sql.Int, offset);
        request.input('limite', sql.Int, parseInt(limite));

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar los datos' });
    } finally {
        await sql.close();
    }
};

module.exports = { obtenerReporteFiltrado };