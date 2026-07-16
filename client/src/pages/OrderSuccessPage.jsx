import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { getOrderByIdRequest } from "../api/orders.api";
import { InvoiceModal } from "../components/ui/InvoiceModal";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { statusColors } from "../constants/statusColors";

// Helper function to auto-download text invoice
function downloadInvoiceText(order) {
  const trackingLink = `${window.location.origin}/order-success/${order.orderNumber}`;
  
  const lineItems = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}${item.variantName ? ` (${item.variantName})` : ""} - Qty: ${item.quantity} - Price: ₹${item.price} - Total: ₹${item.price * item.quantity}`
    )
    .join("\n");

  const invoiceContent = `=====================================================
                    TAX INVOICE
=====================================================
GaramBazaar - India's Finest Everyday Essentials
Sourced direct from local farmers & self-help groups
=====================================================
Invoice No   : INV-${order.orderNumber}
Order Ref    : ${order.orderNumber}
Order Date   : ${new Date(order.createdAt).toLocaleString()}
-----------------------------------------------------
SHIPPING & BILLING ADDRESS:
Name         : ${order.shippingAddress.name}
Phone        : ${order.shippingAddress.phone}
Email        : ${order.shippingAddress.email || "N/A"}
Address Line : ${order.shippingAddress.line1}
City, State  : ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
-----------------------------------------------------
ORDER ITEMS:
${lineItems}
-----------------------------------------------------
SUMMARY:
Subtotal     : ₹${order.subtotal}
Discount     : -₹${order.discount}
Delivery Fee : ₹${order.shippingFee}
-----------------------------------------------------
GRAND TOTAL  : ₹${order.total}
Payment Type : ${order.payment.method.toUpperCase()}
Payment Status: ${order.payment.status.toUpperCase()}
=====================================================
LIVE ORDER TRACKING & DETAILS:
You can track the live progress of your order here:
${trackingLink}
=====================================================
This is a computer generated invoice and requires no signature.
Thank you for shopping at GaramBazaar!
=====================================================`;

  const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `GaramBazaar_Invoice_${order.orderNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getProgressPercentage(order) {
  const status = order.status;
  if (status === "Cancelled" || status === "Returned") return 100;
  
  const historyStatuses = order.statusHistory.map(h => h.status);
  let completedCount = 0;
  const milestones = ["Processing", "On the Way", "Delivered"];
  milestones.forEach((m) => {
    if (historyStatuses.includes(m)) completedCount++;
  });
  
  if (completedCount <= 1) return 0;
  return ((completedCount - 1) / (milestones.length - 1)) * 100;
}

function getMilestonesForOrder(order) {
  if (order.status === "Cancelled") {
    return [
      { status: "Processing", label: "Processing" },
      { status: "Cancelled", label: "Cancelled" },
    ];
  }
  if (order.status === "Returned") {
    return [
      { status: "Processing", label: "Processing" },
      { status: "Delivered", label: "Delivered" },
      { status: "Returned", label: "Returned" },
    ];
  }
  return [
    { status: "Processing", label: "Processing" },
    { status: "On the Way", label: "On the Way" },
    { status: "Delivered", label: "Delivered" },
  ];
}

function getStatusTimelineConfig(status) {
  switch (status) {
    case "Processing":
      return {
        icon: "📦",
        borderColor: "border-blue-200 text-blue-600",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-150",
      };
    case "On the Way":
      return {
        icon: "🚚",
        borderColor: "border-amber-200 text-amber-600",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-150",
      };
    case "Delivered":
      return {
        icon: "🥳",
        borderColor: "border-green-200 text-green-600",
        badgeClass: "bg-green-50 text-green-700 border border-green-150",
      };
    case "Cancelled":
      return {
        icon: "❌",
        borderColor: "border-red-200 text-red-600",
        badgeClass: "bg-red-50 text-red-700 border border-red-150",
      };
    case "Returned":
      return {
        icon: "↩️",
        borderColor: "border-purple-200 text-purple-600",
        badgeClass: "bg-purple-50 text-purple-700 border border-purple-150",
      };
    default:
      return {
        icon: "📌",
        borderColor: "border-gray-200 text-gray-600",
        badgeClass: "bg-gray-50 text-gray-700 border border-gray-150",
      };
  }
}

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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

  useEffect(() => {
    if (order && !downloaded) {
      setDownloaded(true);
      downloadInvoiceText(order);
    }
  }, [order, downloaded]);

  return (
    <section className="page-content success-card min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-150 overflow-hidden p-6 md:p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-emerald-100 animate-bounce">
          🎉
        </div>
        <p className="eyebrow uppercase tracking-widest text-xs font-black text-[#c4622d] mb-2">Order Confirmed</p>
        <h1 className="text-xl md:text-3xl font-black text-gray-950 mb-3">{orderId}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Thank you for your purchase! Your invoice has been downloaded automatically. You can use the link inside the invoice or bookmark this page to track your order anytime.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-8 border-b border-gray-100 pb-8">
          <Link className="px-5 py-2.5 bg-[#c4622d] hover:bg-[#e07a4a] text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer border-0" to="/shop">
            🛍️ Continue Shopping
          </Link>
          {loading ? (
            <span className="text-xs text-gray-400 self-center">Loading Invoice...</span>
          ) : order ? (
            <button
              type="button"
              onClick={() => setInvoiceModalOpen(true)}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:border-[#c4622d] hover:bg-orange-50/20 text-gray-800 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              📄 View Invoice
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : order ? (
          <div className="text-left bg-gray-50/50 rounded-2xl border border-gray-200 p-5 md:p-8">
            <div className="mb-6 flex justify-between items-center gap-2 flex-wrap">
              <h3 className="m-0 text-sm font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <span>📍</span> Shipping Status
              </h3>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[order.status] || "bg-gray-150 text-gray-805"}`}>
                {order.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8 mt-4 px-4">
              <div className="absolute top-3 left-4 right-4 h-[3px] bg-gray-200 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-3 left-4 h-[3px] bg-[#c4622d] -translate-y-1/2 rounded-full transition-all duration-500" 
                style={{ width: `${getProgressPercentage(order)}%` }}
              />
              <div className="relative flex justify-between items-center">
                {getMilestonesForOrder(order).map((m, idx) => {
                  const completed = order.statusHistory.some((h) => h.status === m.status);
                  const isCurrent = order.status === m.status;
                  return (
                    <div key={m.status} className="flex flex-col items-center relative z-10">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                          completed
                            ? "bg-[#c4622d] border-[#c4622d] text-white"
                            : isCurrent
                            ? "bg-amber-50 border-[#c4622d] text-[#c4622d] scale-110 shadow-sm"
                            : "bg-white border-gray-200 text-gray-400"
                        }`}
                      >
                        {completed ? "✓" : idx + 1}
                      </div>
                      <span className={`text-[9px] font-bold mt-2 tracking-wide uppercase ${
                        isCurrent ? "text-[#c4622d]" : completed ? "text-gray-700" : "text-gray-400"
                      }`}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Travel Timeline */}
            <div className="border-t border-gray-200/60 pt-5 mt-6">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-4">Journey Timeline</h4>
              <div className="relative border-l border-dashed border-gray-300 ml-4 space-y-5">
                {[...order.statusHistory].reverse().map((history, idx) => {
                  const config = getStatusTimelineConfig(history.status);
                  return (
                    <div key={idx} className="relative pl-7">
                      <div className="absolute left-0 top-1.5 -translate-x-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-[8px]">
                        {config.icon}
                      </div>
                      <p className="text-xs font-bold text-gray-900 leading-tight m-0">{history.status}</p>
                      <p className="text-[10px] text-gray-500 m-0 leading-normal">{formatDate(history.updatedAt)}</p>
                      {history.note && <p className="text-[10px] text-gray-400 italic mt-0.5 leading-normal">Note: {history.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm font-semibold">Failed to fetch order details. Please bookmark this URL for future tracking.</p>
        )}
      </div>

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
