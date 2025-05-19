import { useState } from 'react';
import { columnasVisibles, encabezados } from './utils/config/columnHeaders';
import { formatDate } from './utils/formatters/formatDate';
import { formatTime } from './utils/formatters/formatTime';
import { emptyValue } from './utils/formatters/emptyValue';

function App() {
  const [data, setData] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    linea: '',
    causa: '',
    tecnologia: ''
  });

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const consultar = async () => {
    const query = new URLSearchParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const res = await fetch(`http://localhost:3001/api/reporte?${query}`);
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
        <label>
          Fecha Inicio:{' '}
          <input type="datetime-local" name="fechaInicio" onChange={handleChange} />
        </label>{' '}
        <label>
          Fecha Fin:{' '}
          <input type="datetime-local" name="fechaFin" onChange={handleChange} />
        </label>{' '}
        <label>
          Línea:{' '}
          <select name="linea" onChange={handleChange}>
            <option value="">(todas)</option>
            <option value="EPP L1">EPP L1</option>
            <option value="EPP L2">EPP L2</option>
            <option value="Lata">Lata</option>
          </select>
        </label>{' '}
        <label>
          Causa:{' '}
          <input name="causa" type="text" onChange={handleChange} placeholder="Ej: Micro-paro" />
        </label>{' '}
        <label>
          Tecnología:{' '}
          <select name="tecnologia" onChange={handleChange}>
            <option value="">(todas)</option>
            <option value="Pouch">Pouch</option>
            <option value="Lata">Lata</option>
            <option value="Formadora">Formadora</option>
          </select>
        </label>{' '}
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