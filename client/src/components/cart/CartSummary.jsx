import { formatCurrency } from "../../utils/formatCurrency";
import { Button } from "../ui/Button";

export function CartSummary({ summary, discount = 0, onCheckout, code = "" }) {
  const shipping = summary.subtotal >= 500 || summary.subtotal === 0 ? 0 : 49;
  const total = Math.max(summary.subtotal + shipping - discount, 0);

  return (
    <aside className="order-summary">
      <h3>Order Summary</h3>
      <div className="sum-row">
        <span>Subtotal ({summary.itemCount} items)</span>
        <span>{formatCurrency(summary.subtotal)}</span>
      </div>
      <div className="sum-row">
        <span>Shipping</span>
        <span>{shipping === 0 ? "FREE 🎉" : formatCurrency(shipping)}</span>
      </div>
      {discount > 0 ? (
        <div className="sum-row save">
          <span>Promo Discount {code ? `(${code})` : ""}</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      ) : null}
      <div className="sum-row total">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <Button className="checkout-cta" onClick={onCheckout}>
        Proceed to Checkout →
      </Button>
      <div className="secure-icons">🔒 Secure · 💳 All Cards · 📦 Easy Returns</div>
    </aside>
  );
}
