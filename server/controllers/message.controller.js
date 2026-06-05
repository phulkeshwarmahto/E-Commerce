import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/Message.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Notification } from "../models/Notification.model.js";

export const sendMessage = async (req, res) => {
  const { orderId, text, recipient } = req.body;
  if (!orderId || !text || !text.trim()) {
    return res.status(400).json(new ApiResponse(false, "Order ID and text are required."));
  }

  // Find the order (support orderNumber or MongoDB ObjectId)
  let order = await Order.findOne({ orderNumber: orderId });
  if (!order) {
    try {
      order = await Order.findById(orderId);
    } catch (err) {
      // Invalid ID format
    }
  }

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  // Identify buyer and seller(s)
  const buyerId = order.userId.toString();
  const productIds = order.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const sellers = products.map((p) => p.seller?.toString()).filter(Boolean);

  const senderId = req.user._id.toString();
  const isBuyer = senderId === buyerId;
  const isSeller = sellers.includes(senderId);
  const isAdmin = req.user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to chat about this order."));
  }

  // Determine recipient
  let finalRecipient = recipient;
  if (!finalRecipient) {
    if (isBuyer) {
      // Default to first seller
      finalRecipient = sellers[0];
    } else {
      // Default to buyer
      finalRecipient = buyerId;
    }
  }

  if (!finalRecipient) {
    return res.status(400).json(new ApiResponse(false, "Recipient could not be resolved."));
  }

  const message = await Message.create({
    orderId: order._id,
    sender: req.user._id,
    recipient: finalRecipient,
    text: text.trim(),
  });

  // Create real-time notification alert for recipient
  try {
    await Notification.create({
      userId: finalRecipient,
      title: `💬 New Message - Order ${order.orderNumber}`,
      message: `${req.user.name || "User"}: ${text.trim().substring(0, 50)}${text.trim().length > 50 ? "..." : ""}`,
    });
  } catch (err) {
    console.error("Failed to trigger message notification:", err);
  }

  return res.status(201).json(
    new ApiResponse(true, "Message sent.", { message: message.toClient() })
  );
};

export const getOrderMessages = async (req, res) => {
  const { orderId } = req.params;

  let order = await Order.findOne({ orderNumber: orderId });
  if (!order) {
    try {
      order = await Order.findById(orderId);
    } catch (err) {
      // Invalid ID
    }
  }

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  // Verify access
  const buyerId = order.userId.toString();
  const productIds = order.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const sellers = products.map((p) => p.seller?.toString()).filter(Boolean);

  const userId = req.user._id.toString();
  const isBuyer = userId === buyerId;
  const isSeller = sellers.includes(userId);
  const isAdmin = req.user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to view messages for this order."));
  }

  const messages = await Message.find({ orderId: order._id }).sort({ createdAt: 1 });

  // Mark recipient's messages as read
  await Message.updateMany(
    { orderId: order._id, recipient: req.user._id, read: false },
    { $set: { read: true } }
  );

  return res.json(
    new ApiResponse(true, "Messages fetched.", {
      messages: messages.map((m) => m.toClient()),
    })
  );
};
