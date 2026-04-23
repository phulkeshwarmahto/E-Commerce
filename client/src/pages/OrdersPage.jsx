import { useState } from "react";
import { statusColors } from "../constants/statusColors";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export function OrdersPage() {
  const { orders } = useAppContext();
  const [trackingId, setTrackingId] = useState(null);
  const trackSteps = ["Order Placed", "Order Confirmed", "Shipped", "Out for Delivery", "Delivered"];

  return (
    <section className="page-content">
      <div className="orders-page">
        <h2>📦 My Orders</h2>
        {!orders.orders.length ? (
          <div className="empty-state">
            <p>📦</p>
            <h3>No orders yet</h3>
            <small>Your orders will appear here.</small>
          </div>
        ) : null}
        {orders.orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-head">
              <div>
                <div className="order-meta">
                  Order ID: <strong>{order.id}</strong>
                </div>
                <div className="order-meta">Placed on {formatDate(order.createdAt)}</div>
              </div>
              <span className={`order-status ${statusColors[order.status] || ""}`}>{order.status}</span>
            </div>
            <div className="order-card-body">
              <div className="order-items">
                {order.items.map((item) => item.name).join(" · ")}
              </div>
              <div className="order-footer">
                <span className="order-total">{formatCurrency(order.total)}</span>
                <button
                  className="track-btn"
                  onClick={() => setTrackingId((current) => (current === order.id ? null : order.id))}
                >
                  {trackingId === order.id ? "Hide Tracking ▲" : "Track Order ▼"}
                </button>
              </div>
            </div>
            {trackingId === order.id ? (
              <div className="track-panel">
                <div className="track-steps">
                  {trackSteps.map((step, index) => (
                    <div key={step} className="track-step">
                      <div className={`track-dot ${index < 2 ? "done" : index === 2 ? "current" : ""}`} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
