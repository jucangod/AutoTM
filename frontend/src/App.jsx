import { useState } from 'react';
import { formatearFecha, formatearTiempo, limpiarValor } from './utils';
import {encabezados, columnasVisibles} from './columnHeader';

function App() {
  const [data, setData] = useState([]);

  const consultar = async () => {
    const res = await fetch('http://localhost:3001/api/reporte');
    const json = await res.json();

    const procesado = json.map(fila => ({
      ...fila,
      FechaInicio: formatearFecha(fila.FechaInicio),
      FechaFin: formatearFecha(fila.FechaFin),
      Tiempo: formatearTiempo(fila.Tiempo),
    }));

    setData(procesado);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reporte de Tiempos Muertos</h1>
      <button onClick={consultar}>Cargar datos</button>

      {data.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
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
                  <td key={i}>{limpiarValor(fila[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data.length === 0 && <p>No hay datos cargados todavía.</p>}
    </div>
  );
}

export default App;