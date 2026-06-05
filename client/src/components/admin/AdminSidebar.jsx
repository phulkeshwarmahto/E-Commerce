export function AdminSidebar({ section, onChange }) {
  const sections = ["overview", "products", "orders", "reviews", "users", "reports", "returns", "messaging", "coupons", "brands"];

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
