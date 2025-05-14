const formatDate = fecha => {
    const f = new Date(fecha);
    return `${f.toLocaleDateString()} ${f.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export { formatDate };