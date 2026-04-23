export const productValidator = [
  (req) => (!req.body.name ? "Product name is required." : null),
  (req) => (!req.body.category ? "Category is required." : null),
  (req) => (req.body.price === undefined ? "Price is required." : null),
];
