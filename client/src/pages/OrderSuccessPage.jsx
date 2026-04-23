import { Link, useParams } from "react-router-dom";

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <section className="page-content success-card">
      <p className="eyebrow">Order placed</p>
      <h1 className="page-title">{orderId}</h1>
      <p>Your order is confirmed and has been added to the Orders dashboard.</p>
      <div className="button-row">
        <Link className="button button-primary" to="/orders">
          Track orders
        </Link>
        <Link className="button button-secondary" to="/shop">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
