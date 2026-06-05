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
          .map((item) => {
            const prod = item.product;
            let price = prod.price;
            let originalPrice = prod.originalPrice;
            if (item.variantName && prod.variants) {
              const variant = prod.variants.find((v) => v.name === item.variantName);
              if (variant) {
                price = variant.price;
                originalPrice = variant.originalPrice;
              }
            }
            return {
              ...prod,
              price,
              originalPrice,
              variantName: item.variantName,
              quantity: item.quantity,
            };
          });

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
        variantName: item.variantName,
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
      const existing = current.find(
        (item) => item.id === product.id && item.variantName === product.variantName,
      );
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.variantName === product.variantName
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  };

  const bulkAddToCart = (products) => {
    updateItems((current) => {
      let next = [...current];
      products.forEach((p) => {
        const existingIdx = next.findIndex(
          (item) => item.id === p.id && item.variantName === p.variantName,
        );
        if (existingIdx > -1) {
          next[existingIdx] = {
            ...next[existingIdx],
            quantity: next[existingIdx].quantity + (p.quantity || 1),
          };
        } else {
          next.push({ ...p, quantity: p.quantity || 1 });
        }
      });
      return next;
    });
  };

  const updateQuantity = (productId, quantity, variantName) => {
    updateItems((current) =>
      current.map((item) =>
        item.id === productId && item.variantName === variantName
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId, variantName) => {
    updateItems((current) =>
      current.filter((item) => !(item.id === productId && item.variantName === variantName)),
    );
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
    bulkAddToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    summary,
  };
}
