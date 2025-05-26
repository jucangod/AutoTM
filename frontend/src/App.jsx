import { useState } from 'react';
import { columnasVisibles, encabezados } from './utils/config/columnHeaders';
import { formatDate } from './utils/formatters/formatDate';
import { formatTime } from './utils/formatters/formatTime';
import { formatProgram } from './utils/formatters/formatProgram';
import { emptyValue } from './utils/formatters/emptyValue';
import { Linea, Periodo, Equipo, Semana, Programado } from './components/filterOptions';
import { SelectFilter } from './components/selectFilters';
import './styles/global.css';

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
      Programado: formatProgram(fila.Programado)
    }));

    setData(procesado);
    setPagina(json.pagina);
    setTotalPaginas(json.totalPaginas);
  };

  return (
    <div className='container'>
      <h1>Reporte de Tiempos Muertos</h1>

      <div className='filtros'>
        <label>
          Inicio:{' '}
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
        </label>
        <label>
          Fin:{' '}
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
        <table border="1" cellPadding="5">
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
        <div className="paginador">
          <button onClick={() => consultar(pagina - 1)} disabled={pagina === 1}>
            ⟨
          </button>

          {pagina > 2 && <button onClick={() => consultar(1)}>1</button>}
          {pagina > 3 && <span className="puntos">...</span>}
          {pagina > 1 && <button onClick={() => consultar(pagina - 1)}>{pagina - 1}</button>}

          <button className="active">{pagina}</button>

          {pagina < totalPaginas && <button onClick={() => consultar(pagina + 1)}>{pagina + 1}</button>}
          {pagina < totalPaginas - 2 && <span className="puntos">...</span>}
          {pagina < totalPaginas - 1 && (
            <button onClick={() => consultar(totalPaginas)}>{totalPaginas}</button>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            const paginaDestino = parseInt(e.target.elements.paginaDestino.value);
            if (paginaDestino >= 1 && paginaDestino <= totalPaginas) {
              consultar(paginaDestino);
            }
          }} className="ir-a-pagina-form">
            <label htmlFor="paginaDestino" className="ir-a-label">Ir a:</label>
            <input
              type="number"
              name="paginaDestino"
              min="1"
              max={totalPaginas}
              defaultValue={pagina}
              className="ir-a-input"
            />
            <button type="submit" className="ir-a-boton">Ir</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;