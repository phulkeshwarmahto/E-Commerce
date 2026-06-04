import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { statusColors } from "../constants/statusColors";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { ReportModal } from "../components/ui/ReportModal";

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, user } = useAppContext();
  const [trackingId, setTrackingId] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "seller", id: "", name: "" });

  useDocumentMetadata({
    title: "My Orders",
    description: "Track your orders, view shipping status, and browse purchase history on GramBazaar."
  });

  const trackSteps = ["Order Placed", "Order Confirmed", "Shipped", "Out for Delivery", "Delivered"];

  if (user?.role === "seller") {
    return (
      <section className="page-content text-center py-20 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <span className="text-5xl">🏪</span>
          <h2 className="text-2xl font-black text-gray-900 mt-4 mb-2">Merchant Viewing Mode</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sellers are restricted from purchasing products and viewing buyer order pages.
          </p>
          <button
            onClick={() => navigate("/seller")}
            className="w-full bg-[#c4622d] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-md transition-all text-sm"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </section>
    );
  }

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
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportTarget({ type: "seller", id: order.id, name: `Order #${order.id}` });
                      setReportModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:text-red-650 hover:border-red-200 hover:bg-red-50/10 transition-all cursor-pointer"
                  >
                    ⚠️ Report Issue
                  </button>
                  <button
                    className="track-btn"
                    onClick={() => setTrackingId((current) => (current === order.id ? null : order.id))}
                  >
                    {trackingId === order.id ? "Hide Tracking ▲" : "Track Order ▼"}
                  </button>
                </div>
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
      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportType={reportTarget.type}
        targetId={reportTarget.id}
        targetName={reportTarget.name}
      />
    </section>
  );
}
