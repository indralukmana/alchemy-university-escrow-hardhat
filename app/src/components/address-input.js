export function AddressInput({ value, onChange, label }) {
  const handleInput = (e) => {
    const { value } = e.target;
    onChange(value);
  };

  return (
    <label>
      {label}
      <input
        type="text"
        value={value}
        onChange={handleInput}
        placeholder="0x0..."
        className="input"
      />
    </label>
  );
}
