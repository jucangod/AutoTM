CREATE OR ALTER VIEW vw_ReporteTMExpandido AS
WITH Base AS (
  SELECT
    FechaInicio,
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
    Causa AS CausaPrincipal,
    DetalleCausa,
    Tiempo,
    Usuario,
    Comentario,

    Tiempo / 3600 AS Hr,
    (Tiempo % 3600) / 60 AS Min,
    Tiempo % 60 AS Seg,

    (Tiempo / 3600.0) AS TiempoParoTotal,

    CASE 
      WHEN LOWER(Causa) IN (
        'arranque de producción', 'arranque de produccion', 
        'cambio de formato', 'cambio de producto', 
        'limpieza/higiene', 'limpieza', 'limpieza programada'
      ) THEN 1 ELSE 0
    END AS Programado,

    CASE 
      WHEN AreaReporte = 'Formadora' THEN 'Formadora'
      ELSE 'Pouch'
    END AS Tecnologia,

    CONCAT('TT9-', Equipo) AS EquipoEspecifico
  FROM ReporteTM
),
Extendida AS (
  SELECT *,
    CASE
      WHEN EquipoEspecifico IN ('TT9-1','TT9-2','TT9-3','TT9-4','TT9-11') THEN 'EPP L1'
      WHEN EquipoEspecifico IN ('TT9-5','TT9-6','TT9-7','TT9-8','TT9-9','TT9-10') THEN 'EPP L2'
      ELSE 'NO'
    END AS Linea
  FROM Base
)
SELECT *,
  CASE WHEN Programado = 1 THEN 0 ELSE TiempoParoTotal END AS TiempoMuerto,

  CASE 
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.33 AND Linea = 'EPP L2' THEN (TiempoParoTotal - 0.33)
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.25 AND Linea = 'EPP L1' THEN (TiempoParoTotal - 0.25)
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.75 AND Linea = 'Lata' THEN (TiempoParoTotal - 0.75)
    ELSE 0
  END AS TMCambioProducto,

  CASE
    WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 0.75 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.75)
    WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 2 AND Tecnologia = 'Lata' THEN (TiempoParoTotal - 2)
    ELSE 0
  END AS CambioFormato,

  CASE
    WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.25 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.25)
    WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.333 AND Tecnologia = 'Latas' THEN (TiempoParoTotal - 0.333)
    ELSE 0
  END AS LimpiezaProgramadaTM,

  (CASE WHEN Programado = 1 THEN 0 ELSE TiempoParoTotal END) +
  (CASE 
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.33 AND Linea = 'EPP L2' THEN (TiempoParoTotal - 0.33)
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.25 AND Linea = 'EPP L1' THEN (TiempoParoTotal - 0.25)
    WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.75 AND Linea = 'Lata' THEN (TiempoParoTotal - 0.75)
    ELSE 0 END) +
  (CASE
    WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 0.75 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.75)
    WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 2 AND Tecnologia = 'Lata' THEN (TiempoParoTotal - 2)
    ELSE 0 END) +
  (CASE
    WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.25 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.25)
    WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.333 AND Tecnologia = 'Latas' THEN (TiempoParoTotal - 0.333)
    ELSE 0 END) AS TiempoMuertoTotalHR,

  TiempoParoTotal -
  (
    (CASE WHEN Programado = 1 THEN 0 ELSE TiempoParoTotal END) +
    (CASE 
      WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.33 AND Linea = 'EPP L2' THEN (TiempoParoTotal - 0.33)
      WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.25 AND Linea = 'EPP L1' THEN (TiempoParoTotal - 0.25)
      WHEN CausaPrincipal = 'Cambio de producto' AND TiempoParoTotal > 0.75 AND Linea = 'Lata' THEN (TiempoParoTotal - 0.75)
      ELSE 0 END) +
    (CASE
      WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 0.75 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.75)
      WHEN CausaPrincipal = 'Cambio de Formato' AND TiempoParoTotal > 2 AND Tecnologia = 'Lata' THEN (TiempoParoTotal - 2)
      ELSE 0 END) +
    (CASE
      WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.25 AND Tecnologia = 'Pouch' THEN (TiempoParoTotal - 0.25)
      WHEN LOWER(CausaPrincipal) = 'limpieza programada' AND TiempoParoTotal > 0.333 AND Tecnologia = 'Latas' THEN (TiempoParoTotal - 0.333)
      ELSE 0 END)
  ) AS TProgramado,

  DATEPART(DAY, FechaInicio) AS D,
  DATEPART(MONTH, FechaInicio) AS M,
  DATEPART(YEAR, FechaInicio) AS A,
  CAST(FechaInicio AS DATE) AS Fecha,

  CASE 
    WHEN CausaPrincipal = 'Falla de equipo' THEN 'Mantenimiento'
    WHEN CausaPrincipal = 'Falta de Servicios' THEN 'Servicios'
    WHEN CausaPrincipal = 'Mantenimiento Planeado' THEN 'Mantenimiento'
    ELSE 'Operación'
  END AS AuxiliarAsignarTM

FROM Extendida;