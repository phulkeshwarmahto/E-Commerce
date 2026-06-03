import { formatCurrency } from "../../utils/formatCurrency";

export function CartSummary({ items = [], summary, discount = 0, onCheckout, code = "" }) {
  const shipping = items.reduce((sum, item) => sum + (item.deliveryFee || 0) * item.quantity, 0);
  const total = Math.max(summary.subtotal + shipping - discount, 0);
  const totalSavings = discount;

  return (
    <aside className="sticky top-24 bg-white rounded-xl border border-gray-200
                      shadow-sm overflow-hidden h-fit">

      {/* Header */}
      <div className="bg-[#f5f0e8] px-5 py-4 border-b border-gray-200">
        <h3 className="text-[0.95rem] font-bold text-[#2c1a0e] uppercase tracking-wide">
          Order Summary
        </h3>
        <p className="text-[0.75rem] text-gray-500 mt-0.5">{summary.itemCount} item{summary.itemCount !== 1 ? "s" : ""} in cart</p>
      </div>

      <div className="px-5 py-4 space-y-3">

        {/* Line Items */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({summary.itemCount} items)</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery Charges</span>
          <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : "text-gray-900"}`}>
            {shipping === 0 ? (summary.subtotal > 0 ? "FREE 🎉" : "—") : formatCurrency(shipping)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Promo{code ? ` (${code})` : ""}</span>
            <span className="font-semibold">−{formatCurrency(discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-[0.95rem]">Total</span>
            <span className="font-bold text-gray-900 text-[1.05rem]">{formatCurrency(total)}</span>
          </div>
          {totalSavings > 0 && (
            <p className="text-[0.75rem] text-emerald-600 font-semibold text-right mt-0.5">
              You save {formatCurrency(totalSavings)} 🎉
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onCheckout}
          className="w-full bg-[#c4622d] hover:bg-[#e07a4a] active:scale-[0.98]
                     text-white font-bold py-3.5 rounded-lg text-sm transition-all duration-150
                     shadow-sm hover:shadow-md mt-2"
        >
          Proceed to Checkout →
        </button>

        {/* Trust Signals */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          {[["🔒", "Secure"], ["💳", "All Cards"], ["↩️", "Easy Returns"]].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">{icon}</span>
              <span className="text-[0.62rem] text-gray-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
