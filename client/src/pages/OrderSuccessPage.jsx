import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { getOrderByIdRequest } from "../api/orders.api";
import { InvoiceModal } from "../components/ui/InvoiceModal";

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useDocumentMetadata({
    title: "Order Success",
    description: "Thank you for shopping at GaramBazaar! Your order is being processed.",
    noindex: true
  });

  useEffect(() => {
    getOrderByIdRequest(orderId)
      .then((data) => {
        if (data && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => {
        console.error("Failed to load order details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  return (
    <section className="page-content success-card">
      <p className="eyebrow">Order placed</p>
      <h1 className="page-title">{orderId}</h1>
      <p>Your order is confirmed and has been added to the Orders dashboard.</p>
      <div className="button-row">
        <Link className="button button-primary" to="/orders">
          Track orders
        </Link>
        {loading ? (
          <span className="text-xs text-gray-500">Loading invoice details...</span>
        ) : order ? (
          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="button button-secondary flex items-center gap-1.5 cursor-pointer"
          >
            📄 View Invoice
          </button>
        ) : null}
        <Link className="button button-secondary" to="/shop">
          Continue shopping
        </Link>
      </div>

      {/* Invoice Modal */}
      {order && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          order={order}
        />
      )}
    </section>
  );
}
