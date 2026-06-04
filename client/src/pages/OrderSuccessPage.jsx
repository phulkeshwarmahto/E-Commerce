import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { useAppContext } from "../hooks/useAppContext";
import { InvoiceModal } from "../components/ui/InvoiceModal";

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const { orders } = useAppContext();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useDocumentMetadata({
    title: "Order Success",
    description: "Thank you for shopping at GramBazaar! Your order is being processed.",
    noindex: true
  });

  const currentOrder = orders.orders.find((o) => o.orderNumber === orderId);

  return (
    <section className="page-content success-card">
      <p className="eyebrow">Order placed</p>
      <h1 className="page-title">{orderId}</h1>
      <p>Your order is confirmed and has been added to the Orders dashboard.</p>
      <div className="button-row">
        <Link className="button button-primary" to="/orders">
          Track orders
        </Link>
        {currentOrder && (
          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="button button-secondary flex items-center gap-1.5 cursor-pointer"
          >
            📄 View Invoice
          </button>
        )}
        <Link className="button button-secondary" to="/shop">
          Continue shopping
        </Link>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={currentOrder}
      />
    </section>
  );
}
