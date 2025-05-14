// 🔧 Convierte fecha a "dd/mm/yyyy hh:mm"
const formatearFecha = fecha => {
  const f = new Date(fecha);
  return `${f.toLocaleDateString()} ${f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

// 🔧 Convierte segundos a "Xm Ys"
const formatearTiempo = segundos => {
  if (!segundos || isNaN(segundos)) return '-';
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}m ${secs}s`;
};

// 🔧 Sustituye valores nulos o vacíos
const limpiarValor = valor => {
  return valor === null || valor === '' ? '-' : valor;
};

export { formatearFecha, formatearTiempo, limpiarValor };