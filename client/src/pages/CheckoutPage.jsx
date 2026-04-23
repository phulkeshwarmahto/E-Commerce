import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAppContext } from "../hooks/useAppContext";
import { formatCurrency } from "../utils/formatCurrency";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orders, isAuthenticated, notify } = useAppContext();
  const promo = location.state || { code: "", discount: 0 };
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!isAuthenticated) {
    return (
      <section className="page-content">
        <p>Please sign in before checkout.</p>
        <Button onClick={() => navigate("/auth")}>Go to sign in</Button>
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const order = await orders.placeOrder({
      items: cart.items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        emoji: item.emoji,
      })),
      shippingAddress: form,
      paymentMethod: "cod",
      couponCode: promo.code,
      discount: promo.discount,
    });
    cart.clearCart();
    notify(`Order ${order.id} placed.`);
    navigate(`/order-success/${order.id}`);
  };

  return (
    <section className="page-content">
      <div className="checkout-layout">
        <div className="steps">
          {["Delivery Address", "Payment", "Review & Pay"].map((label, index) => (
            <div
              key={label}
              className={`step ${step === index + 1 ? "active" : step > index + 1 ? "done" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

        <form className="form-section" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <h3>📍 Delivery Address</h3>
              <div className="form-row">
                <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Address line" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} required />
              </div>
              <div className="form-row">
                <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
                <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
              </div>
              <div className="form-row full">
                <Input label="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} required />
              </div>
              <Button className="next-btn" type="button" onClick={() => setStep(2)}>
                Continue to Payment →
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h3>💳 Payment Method</h3>
              <div className="payment-options">
                {[
                  ["📲", "UPI", "PhonePe, GPay, Paytm"],
                  ["💳", "Credit / Debit Card", "Visa, Mastercard, RuPay"],
                  ["🏦", "Net Banking", "All major Indian banks"],
                  ["💵", "Cash on Delivery", "Pay when you receive"],
                ].map(([icon, name, desc]) => (
                  <div key={name} className={`pay-option ${name === "Cash on Delivery" ? "selected" : ""}`}>
                    <span className="pay-icon">{icon}</span>
                    <div>
                      <div className="pay-name">{name}</div>
                      <div className="pay-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button className="next-btn" type="button" onClick={() => setStep(3)}>
                  Review Order →
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h3>📋 Review Your Order</h3>
              <div className="review-box">
                <strong>Delivering to:</strong>
                <p>
                  {form.name} · {form.phone}
                  <br />
                  {form.line1}, {form.city}, {form.state} — {form.pincode}
                </p>
              </div>
              <div className="review-box">
                <strong>Payment:</strong>
                <p>Cash on Delivery</p>
              </div>
              <div className="review-total">
                <span>Order Total</span>
                <strong>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</strong>
              </div>
              <div className="checkout-actions">
                <Button className="next-btn next-btn-secondary" type="button" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button className="next-btn place-btn" type="submit" disabled={!cart.items.length}>
                  ✅ Place Order
                </Button>
              </div>
            </>
          ) : null}
        </form>

        <aside className="mini-cart">
          <h4>Your Items ({cart.summary.itemCount})</h4>
          {cart.items.map((item) => (
            <div key={item.id} className="mini-item">
              <span className="me">{item.emoji || "📦"}</span>
              <span className="mn">
                {item.name} ×{item.quantity}
              </span>
              <span className="mp">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mini-total">
            <span>Total</span>
            <span>{formatCurrency(Math.max(cart.summary.subtotal - promo.discount, 0))}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
