const { sql, config } = require('../db');

const obtenerReporteFiltrado = async (req, res) => {
    const { fechaInicio, fechaFin, linea, periodo, semana, equipoEspecifico, programado } = req.query;
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
        conditions.push(`CONVERT(date, FechaInicio) >= @FechaInicio`);
    }

    if (fechaFin) {
        conditions.push(`CONVERT(date, FechaInicio) <= @FechaFin`);
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

        // Entradas para los filtros
        if (linea) request.input('Linea', sql.VarChar, linea);
        if (periodo) request.input('Periodo', sql.Int, parseInt(periodo));
        if (semana) request.input('Semana', sql.Int, parseInt(semana));
        if (equipoEspecifico) request.input('EquipoEspecifico', sql.VarChar, equipoEspecifico);
        if (fechaInicio) request.input('FechaInicio', sql.Date, new Date(fechaInicio));
        if (fechaFin) request.input('FechaFin', sql.Date, new Date(fechaFin));
        if (programado !== undefined && programado !== null && programado !== '') {
            request.input('Programado', sql.Bit, parseInt(programado));
        }

        // Para la paginación
        request.input('offset', sql.Int, offset);
        request.input('limite', sql.Int, parseInt(limite));

        // Generar condiciones
        let whereClause = conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '';

        // Consulta principal (paginada)
        const dataQuery = `
            SELECT * FROM vw_ReporteTMExpandido
            WHERE 1=1 ${whereClause}
            ORDER BY FechaInicio
            OFFSET @offset ROWS
            FETCH NEXT @limite ROWS ONLY
        `;

        // Consulta del total de registros sin paginar
        const countQuery = `
            SELECT COUNT(*) AS total FROM vw_ReporteTMExpandido
            WHERE 1=1 ${whereClause}
        `;

        const dataResult = await request.query(dataQuery);

        // Hacemos una nueva instancia porque `Request` no permite múltiples queries a la vez
        const countRequest = new sql.Request();

        // Volver a pasar los mismos parámetros para count
        if (linea) countRequest.input('Linea', sql.VarChar, linea);
        if (periodo) countRequest.input('Periodo', sql.Int, parseInt(periodo));
        if (semana) countRequest.input('Semana', sql.Int, parseInt(semana));
        if (equipoEspecifico) countRequest.input('EquipoEspecifico', sql.VarChar, equipoEspecifico);
        if (fechaInicio) countRequest.input('FechaInicio', sql.Date, new Date(fechaInicio));
        if (fechaFin) countRequest.input('FechaFin', sql.Date, new Date(fechaFin));
        if (programado !== undefined && programado !== null && programado !== '') {
            countRequest.input('Programado', sql.Bit, parseInt(programado));
        }

        const countResult = await countRequest.query(countQuery);
        const total = countResult.recordset[0].total;
        const totalPaginas = Math.ceil(total / limite);

        res.json({
            data: dataResult.recordset,
            pagina: Number(pagina),
            totalPaginas
        });
        } catch (err) {
        console.error('Error al consultar la BD:', err);
        res.status(500).json({ error: 'Error al consultar los datos' });
    }
};

module.exports = { obtenerReporteFiltrado };