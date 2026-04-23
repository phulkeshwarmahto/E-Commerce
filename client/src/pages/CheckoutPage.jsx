import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAppContext } from "../hooks/useAppContext";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orders, isAuthenticated, notify } = useAppContext();
  const promo = location.state || { code: "", discount: 0 };
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
    <section className="page-content two-column">
      <form className="stack" onSubmit={handleSubmit}>
        <div className="section-head">
          <h1 className="page-title">Checkout</h1>
        </div>
        <Input label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
        <Input label="Address line" value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} required />
        <div className="form-row">
          <Input label="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
          <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} required />
        </div>
        <Input label="Pincode" value={form.pincode} onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))} required />
        <Button type="submit" disabled={!cart.items.length}>
          Place Order
        </Button>
      </form>
      <aside className="summary-card">
        <h3>Items</h3>
        {cart.items.map((item) => (
          <div key={item.id} className="summary-row">
            <span>
              {item.name} x {item.quantity}
            </span>
            <strong>{item.price * item.quantity}</strong>
          </div>
        ))}
      </aside>
    </section>
  );
}
