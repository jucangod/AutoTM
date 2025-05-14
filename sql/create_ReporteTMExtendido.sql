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
    Causa AS [Causa Principal],
    DetalleCausa,
    Tiempo,
    Usuario,
    Comentario,

    Tiempo / 3600 AS Hr,
    (Tiempo % 3600) / 60 AS Min,
    Tiempo % 60 AS Seg,

    (Tiempo / 3600.0) AS [Tiempo de Paro Total],

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

    CONCAT(Usuario, '- ', Equipo) AS [Equipo Especifico]
  FROM ReporteTM
),
Extendida AS (
  SELECT *,
    CASE
      WHEN [Equipo Especifico] IN ('TT9- 1','TT9- 2','TT9- 3','TT9- 4','TT9- 11') THEN 'EPP L1'
      WHEN [Equipo Especifico] IN ('TT9- 5','TT9- 6','TT9- 7','TT9- 8','TT9- 9','TT9- 10') THEN 'EPP L2'
      ELSE 'NO'
    END AS Linea
  FROM Base
)
SELECT *,
  CASE WHEN Programado = 1 THEN 0 ELSE [Tiempo de Paro Total] END AS [Tiempo Muerto],

  CASE 
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.33 AND Linea = 'EPP L2' THEN ([Tiempo de Paro Total] - 0.33)
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.25 AND Linea = 'EPP L1' THEN ([Tiempo de Paro Total] - 0.25)
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.75 AND Linea = 'Lata' THEN ([Tiempo de Paro Total] - 0.75)
    ELSE 0
  END AS [TM Cambio de Producto],

  CASE
    WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 0.75 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.75)
    WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 2 AND Tecnologia = 'Lata' THEN ([Tiempo de Paro Total] - 2)
    ELSE 0
  END AS [Cambio de Formato],

  CASE
    WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.25 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.25)
    WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.333 AND Tecnologia = 'Latas' THEN ([Tiempo de Paro Total] - 0.333)
    ELSE 0
  END AS [Limpieza Programada TM],

  (CASE WHEN Programado = 1 THEN 0 ELSE [Tiempo de Paro Total] END) +
  (CASE 
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.33 AND Linea = 'EPP L2' THEN ([Tiempo de Paro Total] - 0.33)
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.25 AND Linea = 'EPP L1' THEN ([Tiempo de Paro Total] - 0.25)
    WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.75 AND Linea = 'Lata' THEN ([Tiempo de Paro Total] - 0.75)
    ELSE 0 END) +
  (CASE
    WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 0.75 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.75)
    WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 2 AND Tecnologia = 'Lata' THEN ([Tiempo de Paro Total] - 2)
    ELSE 0 END) +
  (CASE
    WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.25 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.25)
    WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.333 AND Tecnologia = 'Latas' THEN ([Tiempo de Paro Total] - 0.333)
    ELSE 0 END) AS [Tiempo Muerto Total (HR)],

  [Tiempo de Paro Total] -
  (
    (CASE WHEN Programado = 1 THEN 0 ELSE [Tiempo de Paro Total] END) +
    (CASE 
      WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.33 AND Linea = 'EPP L2' THEN ([Tiempo de Paro Total] - 0.33)
      WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.25 AND Linea = 'EPP L1' THEN ([Tiempo de Paro Total] - 0.25)
      WHEN [Causa Principal] = 'Cambio de producto' AND [Tiempo de Paro Total] > 0.75 AND Linea = 'Lata' THEN ([Tiempo de Paro Total] - 0.75)
      ELSE 0 END) +
    (CASE
      WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 0.75 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.75)
      WHEN [Causa Principal] = 'Cambio de Formato' AND [Tiempo de Paro Total] > 2 AND Tecnologia = 'Lata' THEN ([Tiempo de Paro Total] - 2)
      ELSE 0 END) +
    (CASE
      WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.25 AND Tecnologia = 'Pouch' THEN ([Tiempo de Paro Total] - 0.25)
      WHEN LOWER([Causa Principal]) = 'limpieza programada' AND [Tiempo de Paro Total] > 0.333 AND Tecnologia = 'Latas' THEN ([Tiempo de Paro Total] - 0.333)
      ELSE 0 END)
  ) AS [T. Programado],

  DATEPART(DAY, FechaInicio) AS D,
  DATEPART(MONTH, FechaInicio) AS M,
  DATEPART(YEAR, FechaInicio) AS A,
  CAST(FechaInicio AS DATE) AS Fecha,

  CASE 
    WHEN [Causa Principal] = 'Falla de equipo' THEN 'Mantenimiento'
    WHEN [Causa Principal] = 'Falta de Servicios' THEN 'Servicios'
    WHEN [Causa Principal] = 'Mantenimiento Planeado' THEN 'Mantenimiento'
    ELSE 'Operación'
  END AS [Auxiliar Asignar TM]

FROM Extendida;