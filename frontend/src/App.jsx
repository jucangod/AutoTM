import { useState } from 'react';
import { columnasVisibles, encabezados } from './utils/config/columnHeaders';
import { formatDate } from './utils/formatters/formatDate';
import { formatTime } from './utils/formatters/formatTime';
import { formatProgram } from './utils/formatters/formatProgram';
import { emptyValue } from './utils/formatters/emptyValue';
import { Linea, Periodo, Equipo, Semana, Programado } from './components/filterOptions';
import { SelectFilter } from './components/selectFilters';

function App() {
  const [pagina, setPagina] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    linea: '',
    periodo: '',
    semana: '',
    equipoEspecifico: '',
  });

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const consultar = async (reset = false) => {
    const query = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    query.append('pagina', reset ? 1 : pagina);
    query.append('limite', 20); // puedes ajustar esto

    const res = await fetch(`http://localhost:3001/api/report?${query}`);
    const json = await res.json();

    const procesado = json.map(fila => ({
      ...fila,
      FechaInicio: formatDate(fila.FechaInicio),
      FechaFin: formatDate(fila.FechaFin),
      Tiempo: formatTime(fila.Tiempo),
      Programado: formatProgram(fila.Programado)
    }));


  if (reset) {
    setData(procesado);
    setPagina(2);
  } else {
    setData(prev => [...prev, ...procesado]);
    setPagina(prev => prev + 1);
  }

    setHasMore(json.length > 0);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reporte de Tiempos Muertos</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Fecha:{' '}
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
        </label>
        <SelectFilter
          label="Línea"
          name="linea"
          value={filtros.linea}
          onChange={handleChange}
          opciones={Linea}
        />
        <SelectFilter 
          label="Periodo"
          name="periodo"
          value={filtros.periodo}
          onChange={handleChange}
          opciones={Periodo}
        />
        <SelectFilter 
          label="Semana"
          name="semana"
          value={filtros.semana}
          onChange={handleChange}
          opciones={Semana}
        />
        <SelectFilter 
          label="Equipo"
          name="equipoEspecifico"
          value={filtros.equipoEspecifico}
          onChange={handleChange}
          opciones={Equipo}
        />
        <SelectFilter 
          label="¿Programado?"
          name="programado"
          value={filtros.programado}
          onChange={handleChange}
          opciones={Programado}
        />
        <button onClick={() => consultar(true)}>Consultar</button>
      </div>

      {data.length > 0 ? (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columnasVisibles.map((col, idx) => (
                <th key={idx}>{encabezados[col] || col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((fila, idx) => (
              <tr key={idx}>
                {columnasVisibles.map((col, i) => (
                  <td key={i}>{emptyValue(fila[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay datos cargados todavía.</p>
      )}
      
      {hasMore && data.length > 0 && (
        <button onClick={() => consultar(false)} style={{ marginTop: '10px' }}>
          Cargar más
        </button>
      )}
    </div>
  );
}

export default App;