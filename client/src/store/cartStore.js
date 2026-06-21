const CART_KEY = "GaramBazaar_cart";

export const getStoredCart = () => {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const setStoredCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};
