ALTER PROCEDURE [dbo].[InsertarReporteTM]
    @FechaInicio DATETIME,
    @FechaFin DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        CREATE TABLE #DatosRemotos (
            FechaInicio DATETIME,
            FechaFin DATETIME,
            Grupo INT,
            Periodo INT,
            Semana INT,
            Frescura CHAR(1),
            CodigoSAP BIGINT,
            Descripcion NVARCHAR(255),
            AreaReporte NVARCHAR(100),
            AreaAfecta NVARCHAR(100),
            Equipo INT,
            Estacion NVARCHAR(100),
            Causa NVARCHAR(100),
            DetalleCausa NVARCHAR(255),
            Tiempo INT,
            Usuario NVARCHAR(100),
            Comentario NVARCHAR(MAX)
        );

        INSERT INTO #DatosRemotos
        EXEC thingworx.twschema.ReporteTM @FechaInicio, @FechaFin;

        -- Normaliza valores vacíos a NULL
        UPDATE #DatosRemotos
        SET
            Causa = NULLIF(LTRIM(RTRIM(Causa)), ''),
            DetalleCausa = NULLIF(LTRIM(RTRIM(DetalleCausa)), '');

        -- Elimina duplicados internos
        ;WITH Dups AS (
          SELECT *,
                 ROW_NUMBER() OVER (PARTITION BY FechaInicio, FechaFin, Equipo, Causa, DetalleCausa, Tiempo
                                    ORDER BY (SELECT NULL)) AS rn
          FROM #DatosRemotos
        )
        DELETE FROM Dups WHERE rn > 1;

        INSERT INTO PowerBi.dbo.ReporteTM (
            FechaInicio, FechaFin, Grupo, Periodo, Semana, Frescura,
            CodigoSAP, Descripcion, AreaReporte, AreaAfecta,
            Equipo, Estacion, Causa, DetalleCausa, Tiempo,
            Usuario, Comentario
        )
        SELECT
            dr.FechaInicio, dr.FechaFin, dr.Grupo, dr.Periodo, dr.Semana, dr.Frescura,
            dr.CodigoSAP, dr.Descripcion, dr.AreaReporte, dr.AreaAfecta,
            dr.Equipo, dr.Estacion, dr.Causa, dr.DetalleCausa, dr.Tiempo,
            dr.Usuario, dr.Comentario
        FROM #DatosRemotos dr
        WHERE NOT EXISTS (
            SELECT 1
            FROM PowerBi.dbo.ReporteTM l
            WHERE
                (l.FechaInicio    = dr.FechaInicio    OR (l.FechaInicio IS NULL AND dr.FechaInicio IS NULL)) AND
                (l.FechaFin      = dr.FechaFin      OR (l.FechaFin IS NULL AND dr.FechaFin IS NULL)) AND
                (l.Equipo        = dr.Equipo        OR (l.Equipo IS NULL AND dr.Equipo IS NULL)) AND
                (l.Causa         = dr.Causa         OR (l.Causa IS NULL AND dr.Causa IS NULL)) AND
                (l.DetalleCausa  = dr.DetalleCausa  OR (l.DetalleCausa IS NULL AND dr.DetalleCausa IS NULL)) AND
                (l.Tiempo        = dr.Tiempo        OR (l.Tiempo IS NULL AND dr.Tiempo IS NULL))
        );

        DROP TABLE #DatosRemotos;

        PRINT '¡Inserción finalizada!';

    END TRY
    BEGIN CATCH
        PRINT 'Error al insertar datos: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END