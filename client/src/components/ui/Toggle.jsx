export function Toggle({ checked, onChange, children }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
