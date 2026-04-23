const WISHLIST_KEY = "grambazaar_wishlist";

export const getStoredWishlist = () => {
  const raw = localStorage.getItem(WISHLIST_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const setStoredWishlist = (wishlist) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};
