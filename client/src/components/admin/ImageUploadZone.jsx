export function ImageUploadZone({ value, onChange }) {
  return (
    <label className="upload-zone">
      <span>Image URL</span>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste an image URL"
      />
    </label>
  );
}
