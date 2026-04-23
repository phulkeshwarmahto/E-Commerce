export const calculateDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};
