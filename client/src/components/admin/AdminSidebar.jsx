export function AdminSidebar({ section, onChange }) {
  const sections = [
    { id: "overview", label: "📊 Overview" },
    { id: "products", label: "📦 Products" },
    { id: "orders", label: "🧾 Orders" },
    { id: "reviews", label: "💬 Reviews" },
    { id: "users", label: "👥 Users" },
    { id: "reports", label: "⚠️ Reports" },
    { id: "returns", label: "🔄 Returns" },
    { id: "messaging", label: "✉️ Messaging" },
    { id: "coupons", label: "🎟️ Coupons" },
    { id: "brands", label: "📢 Spotlights" },
    { id: "categories", label: "📁 Categories" },
    { id: "seller-verifications", label: "🏪 Seller Verify" },
    { id: "review-moderations", label: "🛡️ Review Mod" },
    { id: "support-tickets", label: "🎟️ Support Tickets" },
  ];

  return (
    <aside className="admin-sidebar">
      {sections.map((entry) => (
        <button
          key={entry.id}
          className={section === entry.id ? "active" : ""}
          onClick={() => onChange(entry.id)}
        >
          {entry.label}
        </button>
      ))}
    </aside>
  );
}
