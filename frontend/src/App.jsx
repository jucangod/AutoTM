import { useState, useEffect } from 'react';
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
  const [data, setData] = useState([]);
  const [inputPage, setInputPage] = useState(1);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    linea: '',
    periodo: '',
    semana: '',
    equipoEspecifico: '',
    programado: '',
  });

  useEffect(() => {
    setInputPage(pagina);
  }, [pagina]);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const consultar = async (nuevaPagina = 1) => {
    const query = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    query.append('pagina', nuevaPagina);
    query.append('limite', 20);

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

  const onPageChange = (num) => {
    if (num >= 1 && num <= totalPaginas) {
      consultar(num);
    }
  };

  const handleGoToPage = () => {
    const num = parseInt(inputPage);
    if (!isNaN(num)) {
      onPageChange(num);
    }
  };

  const getVisiblePages = () => {
    const visible = [];
    const range = 2;
    const start = Math.max(2, pagina - range);
    const end = Math.min(totalPaginas - 1, pagina + range);

    visible.push(1);
    if (start > 2) visible.push('...');
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    if (end < totalPaginas - 1) visible.push('...');
    if (totalPaginas > 1) visible.push(totalPaginas);

    return visible;
  };

  return (
    <div className='container'>
      <h1>Reporte de Tiempos Muertos</h1>

      <div className='filtros'>
        <label>
          Inicio:
          <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange} />
        </label>
        <label>
          Fin:
          <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleChange} />
        </label>
        <SelectFilter label="Línea" name="linea" value={filtros.linea} onChange={handleChange} opciones={Linea} />
        <SelectFilter label="Periodo" name="periodo" value={filtros.periodo} onChange={handleChange} opciones={Periodo} />
        <SelectFilter label="Semana" name="semana" value={filtros.semana} onChange={handleChange} opciones={Semana} />
        <SelectFilter label="Equipo" name="equipoEspecifico" value={filtros.equipoEspecifico} onChange={handleChange} opciones={Equipo} />
        <SelectFilter label="¿Programado?" name="programado" value={filtros.programado} onChange={handleChange} opciones={Programado} />
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
          <button onClick={() => onPageChange(1)} disabled={pagina === 1}>{'≪'}</button>
          <button onClick={() => onPageChange(pagina - 1)} disabled={pagina === 1}>{'<'}</button>

          {getVisiblePages().map((p, i) =>
            p === '...' ? (
              <span key={i} className="puntos">…</span>
            ) : (
              <button
                key={i}
                onClick={() => onPageChange(p)}
                className={pagina === p ? 'active' : ''}
              >
                {p}
              </button>
            )
          )}

          <button onClick={() => onPageChange(pagina + 1)} disabled={pagina === totalPaginas}>{'>'}</button>
          <button onClick={() => onPageChange(totalPaginas)} disabled={pagina === totalPaginas}>{'≫'}</button>

          <div className="ir-a-pagina-form">
            <label className="ir-a-label">Ir a:</label>
            <div className="input-con-lupa">
              <input
                type="number"
                min="1"
                max={totalPaginas}
                className="ir-a-input"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
              />
              <button className="lupa-btn" onClick={handleGoToPage} aria-label="Ir a página">
                🔍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;