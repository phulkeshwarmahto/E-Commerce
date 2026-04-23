import { formatCurrency } from "../../utils/formatCurrency";
import { Button } from "../ui/Button";

export function CartSummary({ summary, discount = 0, onCheckout, code = "" }) {
  const total = Math.max(summary.subtotal - discount, 0);

  return (
    <aside className="summary-card">
      <h3>Order Summary</h3>
      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(summary.subtotal)}</strong>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <strong>Free</strong>
      </div>
      <div className="summary-row">
        <span>Discount {code ? `(${code})` : ""}</span>
        <strong>-{formatCurrency(discount)}</strong>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <Button onClick={onCheckout}>Proceed to Checkout</Button>
    </aside>
  );
}
