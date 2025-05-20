const formatDate = fecha => {
    if (!fecha) return '-';

    const f = new Date(fecha);
    const day = String(f.getUTCDate()).padStart(2, '0');
    const month = String(f.getUTCMonth() + 1).padStart(2, '0');
    const year = f.getUTCFullYear();

    let hours = f.getUTCHours();
    const minutes = String(f.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
};

export { formatDate };