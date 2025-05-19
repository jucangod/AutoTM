import { useState } from 'react';
import { columnasVisibles, encabezados } from './utils/config/columnHeaders';
import { formatDate } from './utils/formatters/formatDate';
import { formatTime } from './utils/formatters/formatTime';
import { emptyValue } from './utils/formatters/emptyValue';
import { Linea, Periodo, Equipo } from './components/filterOptions';
import { SelectFilter } from './components/selectFilters';

function App() {
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    linea: '',
    periodo: '',
    equipo: '',
  });

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const consultar = async () => {
    console.log('Filtros recibidos:', filtros);

    const query = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const res = await fetch(`http://localhost:3001/api/report?${query}`);
    const json = await res.json();

    const procesado = json.map(fila => ({
      ...fila,
      FechaInicio: formatDate(fila.FechaInicio),
      FechaFin: formatDate(fila.FechaFin),
      Tiempo: formatTime(fila.Tiempo)
    }));

    setData(procesado);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reporte de Tiempos Muertos</h1>

      <div style={{ marginBottom: '20px' }}>
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
          label="Equipo"
          name="equipo"
          value={filtros.equipo}
          onChange={handleChange}
          opciones={Equipo}
        />
        <button onClick={consultar}>Consultar</button>
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
    </div>
  );
}

export default App;