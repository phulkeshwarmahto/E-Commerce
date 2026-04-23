import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../utils/mockDb.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getOrders = (req, res) => {
  const orders = db.orders.filter((order) => order.userId === req.user.id);
  res.json(new ApiResponse(true, "Orders fetched.", { orders }));
};

export const createOrder = async (req, res) => {
  const subtotal = req.body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
    items: req.body.items,
    shippingAddress: req.body.shippingAddress,
    payment: {
      method: req.body.paymentMethod || "cod",
      status: "paid",
    },
    subtotal,
    shippingFee: 0,
    discount: req.body.discount || 0,
    couponCode: req.body.couponCode || "",
    total: subtotal - (req.body.discount || 0),
    status: "Processing",
    statusHistory: [
      { status: "Processing", updatedAt: new Date().toISOString(), note: "Order created" },
    ],
  };

  db.orders.unshift(order);
  db.carts[req.user.id] = [];

  const user = db.users.find((entry) => entry.id === req.user.id);
  if (user) {
    await sendEmail({ to: user.email, subject: `Order ${order.id} confirmed` });
  }

  res.status(201).json(new ApiResponse(true, "Order placed.", { order }));
};
