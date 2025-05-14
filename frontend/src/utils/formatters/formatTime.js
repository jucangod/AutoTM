const formatTime = segundos => {
    if (!segundos || isNaN(segundos)) return '-';

    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;

    const partes = [];
    if (h > 0) partes.push(`${h}h`);
    if (m > 0) partes.push(`${m}m`);
    if (s > 0 || partes.length === 0) partes.push(`${s}s`);

    return partes.join(' ');
};

export { formatTime };