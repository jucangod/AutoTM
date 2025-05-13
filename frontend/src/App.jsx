import { useState } from 'react';

function App() {
  const [data, setData] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const consultar = async () => {
    const res = await fetch(`http://localhost:3001/api/reporte?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    const json = await res.json();
    setData(json.salida);
  };

  return (
    <div>
      <h1>Consulta Reporte</h1>
      <input type="datetime-local" onChange={e => setFechaInicio(e.target.value)} />
      <input type="datetime-local" onChange={e => setFechaFin(e.target.value)} />
      <button onClick={consultar}>Consultar</button>
      <pre>{data}</pre>
    </div>
  );
}

export default App;