import { ApiResponse } from "../utils/ApiResponse.js";
import { db, findProductById } from "../utils/mockDb.js";

const buildCartItems = (userId) =>
  (db.carts[userId] || []).map((item) => {
    const product = findProductById(item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product,
    };
  });

export const getCart = (req, res) => {
  res.json(new ApiResponse(true, "Cart fetched.", { items: buildCartItems(req.user.id) }));
};

export const updateCart = (req, res) => {
  db.carts[req.user.id] = req.body.items || [];
  res.json(new ApiResponse(true, "Cart updated.", { items: buildCartItems(req.user.id) }));
};
