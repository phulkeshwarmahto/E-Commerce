export const orderValidator = [
  (req) => (!Array.isArray(req.body.items) || req.body.items.length === 0 ? "At least one order item is required." : null),
  (req) => (!req.body.shippingAddress?.name ? "Shipping address is required." : null),
];
