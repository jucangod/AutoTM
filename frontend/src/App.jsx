import { useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  // Llama al backend para obtener los datos de la tabla ReporteTM
  const consultar = async () => {
    const res = await fetch('http://localhost:3001/api/reporte');
    const json = await res.json();
    setData(json);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reporte de Tiempos Muertos</h1>
      <button onClick={consultar}>Cargar datos</button>

      {/* Muestra la tabla solo si hay datos */}
      {data.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((fila, idx) => (
              <tr key={idx}>
                {Object.values(fila).map((valor, i) => (
                  <td key={i}>{valor}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Mensaje si aún no se han cargado datos */}
      {data.length === 0 && <p>No hay datos cargados todavía.</p>}
    </div>
  );
}

export default App;