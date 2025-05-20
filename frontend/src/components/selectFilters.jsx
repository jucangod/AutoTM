const SelectFilter = ({ label, name, value, onChange, opciones }) => (
  <label style={{ marginRight: '15px' }}>
    {label}:{' '}
    <select name={name} value={value} onChange={onChange}>
      {opciones.map((option, idx) =>
        typeof option === 'object' ? (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ) : (
          <option key={idx} value={option}>
            {option}
          </option>
        )
      )}
    </select>
  </label>
);

export { SelectFilter };