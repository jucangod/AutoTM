CREATE OR ALTER PROCEDURE InsertarReporteTM
    @FechaInicio DATETIME,
    @FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- Limpia la tabla antes de insertar (opcional)
    -- DELETE FROM ReporteTM;

    -- Inserta los resultados del SP original
    INSERT INTO ReporteTM (
        FechaInicio,
        FechaFin,
        Grupo,
        Periodo,
        Semana,
        Frescura,
        CodigoSAP,
        Descripcion,
        AreaReporte,
        AreaAfecta,
        Equipo,
        Estacion,
        Causa,
        DetalleCausa,
        Tiempo,
        Usuario,
        Comentario
    )
    EXEC thingworx.twschema.ReporteTM @FechaInicio, @FechaFin;
END;