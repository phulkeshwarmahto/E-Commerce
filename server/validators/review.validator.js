export const reviewValidator = [
  (req) => (!req.body.productId ? "Product is required." : null),
  (req) => (!req.body.body ? "Review text is required." : null),
];
