export function AdminSidebar({ section, onChange }) {
  const sections = ["overview", "products", "orders", "reviews"];

  return (
    <aside className="admin-sidebar">
      {sections.map((entry) => (
        <button
          key={entry}
          className={section === entry ? "active" : ""}
          onClick={() => onChange(entry)}
        >
          {entry}
        </button>
      ))}
    </aside>
  );
}
