CREATE OR ALTER PROCEDURE InsertarReporteTM
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
        -- Error capturado pero silencioso (sin PRINT)
        -- Aquí podrías loguear el error si usas alguna tabla de logs, pero por ahora queda limpio
    END CATCH
END;