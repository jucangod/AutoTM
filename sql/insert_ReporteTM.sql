ALTER PROCEDURE [dbo].[InsertarReporteTM]
    @FechaInicio DATETIME,
    @FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @fechaInicioStr VARCHAR(25) = CONVERT(VARCHAR, @FechaInicio, 120);
        DECLARE @fechaFinStr VARCHAR(25) = CONVERT(VARCHAR, @FechaFin, 120);
        DECLARE @sql NVARCHAR(MAX);

        SET @sql = N'
        WITH DatosRemotos AS (
            SELECT *
            FROM OPENQUERY(thingworx,
                ''EXEC twschema.ReporteTM ''''' + @fechaInicioStr + ''''', ''''' + @fechaFinStr + ''''' '')
        )
        INSERT INTO PowerBi.dbo.ReporteTM (
            FechaInicio, FechaFin, Grupo, Periodo, Semana, Frescura,
            CodigoSAP, Descripcion, AreaReporte, AreaAfecta,
            Equipo, Estacion, Causa, DetalleCausa, Tiempo,
            Usuario, Comentario
        )
        SELECT dr.FechaInicio, dr.FechaFin, dr.Grupo, dr.Periodo, dr.Semana, dr.Frescura,
               dr.CodigoSAP, dr.Descripcion, dr.AreaReporte, dr.AreaAfecta,
               dr.Equipo, dr.Estacion, dr.Causa, dr.DetalleCausa, dr.Tiempo,
               dr.Usuario, dr.Comentario
        FROM DatosRemotos dr
        WHERE NOT EXISTS (
            SELECT 1
            FROM PowerBi.dbo.ReporteTM l
            WHERE 
                l.FechaInicio = dr.FechaInicio AND
                l.FechaFin = dr.FechaFin AND
                l.Equipo = dr.Equipo AND
                l.Causa = dr.Causa AND
                l.DetalleCausa = dr.DetalleCausa AND
                l.Tiempo = dr.Tiempo
        );
        ';

        EXEC sp_executesql @sql;

    END TRY
    BEGIN CATCH
        PRINT 'Error al insertar datos: ' + ERROR_MESSAGE();
    END CATCH
END;