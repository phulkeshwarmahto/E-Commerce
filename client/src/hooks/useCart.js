import { useEffect, useMemo, useState } from "react";
import { getCartRequest, updateCartRequest } from "../api/cart.api";
import { getStoredCart, setStoredCart } from "../store/cartStore";

export function useCart(token) {
  const [items, setItems] = useState(() => getStoredCart());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStoredCart(items);
  }, [items]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    getCartRequest()
      .then((data) => {
        const nextItems = data.items
          .filter((item) => item.product)
          .map((item) => ({
            ...item.product,
            quantity: item.quantity,
          }));

        if (nextItems.length > 0) {
          setItems(nextItems);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const syncCart = async (nextItems) => {
    if (!token) {
      return;
    }

    await updateCartRequest(
      nextItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    );
  };

  const updateItems = (updater) => {
    setItems((current) => {
      const nextItems = typeof updater === "function" ? updater(current) : updater;
      syncCart(nextItems).catch(() => {});
      return nextItems;
    });
  };

  const addToCart = (product) => {
    updateItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    updateItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    updateItems((current) => current.filter((item) => item.id !== productId));
  };

  const clearCart = () => updateItems([]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items]);

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    summary,
  };
}
