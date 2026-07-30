export function SellerSidebar({ section, onChange }) {
  const sections = [
    { id: "overview", label: "📊 Overview" },
    { id: "products", label: "📦 My Products" },
    { id: "orders", label: "🧾 Orders" },
    { id: "reviews", label: "💬 Reviews" },
    { id: "faqs", label: "❓ Customer Q&A" },
    { id: "returns", label: "🔄 Returns" },
    { id: "coupons", label: "🎟️ My Coupons" },
    { id: "analytics", label: "📈 Sales Analytics" },
    { id: "bulk-upload", label: "📁 Bulk Import" },
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
