CREATE TABLE PowerBi.dbo.ReporteTM (
    FechaInicio      DATETIME,
    FechaFin         DATETIME,
    Grupo            INT,
    Periodo          INT,
    Semana           INT,
    Frescura         CHAR(1),
    CodigoSAP        BIGINT,            -- Numerico largo
    Descripcion      NVARCHAR(255),
    AreaReporte      NVARCHAR(100),
    AreaAfecta       NVARCHAR(100),
    Equipo           INT,
    Estacion         NVARCHAR(100),
    Causa            NVARCHAR(100),
    DetalleCausa     NVARCHAR(255),
    Tiempo           INT,               -- En segundos
    Usuario          NVARCHAR(100),
    Comentario       NVARCHAR(MAX)
);