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
    <section className="page-content">
      <div className="cart-layout">
        <div>
          <div className="cart-title">🛒 My Cart ({cart.summary.itemCount} items)</div>
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
          {!cart.items.length ? (
            <div className="empty-state">
              <p>🛒</p>
              <h3>Your cart is empty</h3>
              <small>Add some products to get started.</small>
            </div>
          ) : null}
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
      </div>
    </section>
  );
}
