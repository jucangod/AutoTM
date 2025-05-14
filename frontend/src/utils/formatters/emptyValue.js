const emptyValue = valor => {
    return valor === null || valor === '' ? '-' : valor;
};

export { emptyValue };