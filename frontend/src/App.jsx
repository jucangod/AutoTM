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
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    linea: '',
    periodo: '',
    semana: '',
    equipoEspecifico: '',
  });

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const consultar = async (nuevaPagina = 1) => {
    const query = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    query.append('pagina', nuevaPagina);
    query.append('limite', 20); // o el valor que prefieras

    const res = await fetch(`http://localhost:3001/api/report?${query}`);
    const json = await res.json();

    const procesado = json.data.map(fila => ({
      ...fila,
      FechaInicio: formatDate(fila.FechaInicio),
      FechaFin: formatDate(fila.FechaFin),
      Tiempo: formatTime(fila.Tiempo),
    }));

    setData(procesado);
    setPagina(json.pagina);
    setTotalPaginas(json.totalPaginas);
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
        <label style={{ marginLeft: '15px' }}>
          Fecha fin:{' '}
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
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
        <button onClick={() => consultar(1)}>Consultar</button>
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
      
      {totalPaginas > 1 && (
      <div style={{ marginTop: '15px' }}>
        <button
          onClick={() => consultar(pagina - 1)}
          disabled={pagina === 1}
        >
          ⟨ Anterior
        </button>

        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i}
            onClick={() => consultar(i + 1)}
            style={{
              fontWeight: i + 1 === pagina ? 'bold' : 'normal',
              margin: '0 5px'
            }}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => consultar(pagina + 1)}
          disabled={pagina === totalPaginas}
        >
          Siguiente ⟩
        </button>
      </div>
    )}
        </div>
  );
}

export default App;