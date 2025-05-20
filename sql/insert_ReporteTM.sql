ALTER PROCEDURE [dbo].[InsertarReporteTM]
    @FechaInicio DATETIME,
    @FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
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
    END TRY
    BEGIN CATCH
        PRINT 'Error al insertar datos: ' + ERROR_MESSAGE();
    END CATCH
END;