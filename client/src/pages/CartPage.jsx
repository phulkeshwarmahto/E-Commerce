import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../components/cart/CartItem";
import { CartSummary } from "../components/cart/CartSummary";
import { PromoCode } from "../components/cart/PromoCode";
import { useAppContext } from "../hooks/useAppContext";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, notify } = useAppContext();
  const [promo, setPromo] = useState({ code: "", discount: 0 });

  return (
    <section className="page-content two-column">
      <div className="stack">
        <div className="section-head">
          <h1 className="page-title">Your cart</h1>
        </div>
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={cart.updateQuantity}
            onRemove={(id) => {
              cart.removeFromCart(id);
              notify("Item removed from cart.");
            }}
          />
        ))}
        {!cart.items.length ? <p>Your cart is empty.</p> : null}
        <PromoCode
          subtotal={cart.summary.subtotal}
          onApply={(nextPromo) => {
            setPromo(nextPromo);
            notify(nextPromo.message);
          }}
        />
      </div>
      <CartSummary
        summary={cart.summary}
        discount={promo.discount}
        code={promo.code}
        onCheckout={() => navigate("/checkout", { state: promo })}
      />
    </section>
  );
}
