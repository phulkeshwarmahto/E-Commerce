import { formatCurrency } from "../../utils/formatCurrency";

export function StatCard({ label, value, currency = false }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{currency ? formatCurrency(value) : value}</strong>
    </article>
  );
}
