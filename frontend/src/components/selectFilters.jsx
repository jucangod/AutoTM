function SelectFilter({ label, name, value, onChange, opciones }) {
  return (
    <label>
        {label}:{' '}
        <select name={name} value={value} onChange={onChange}>
            <option value=""> </option>
            {opciones.map((op, idx) => (
            <option key={idx} value={op}>
                {op}
            </option>
            ))}
        </select>{' '}
    </label>
  );
}

export { SelectFilter };