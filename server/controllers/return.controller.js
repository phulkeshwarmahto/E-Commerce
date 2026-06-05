import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/Order.model.js";
import { ReturnRequest } from "../models/ReturnRequest.model.js";
import { Notification } from "../models/Notification.model.js";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";

export const createReturnRequest = async (req, res) => {
  const { orderNumber, items, reason } = req.body;

  if (!orderNumber || !items || !items.length || !reason?.trim()) {
    return res.status(400).json(new ApiResponse(false, "orderNumber, items, and reason are required."));
  }

  const order = await Order.findOne({ orderNumber, userId: req.user._id });
  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  if (order.status !== "Delivered") {
    return res.status(400).json(new ApiResponse(false, "Only delivered orders can be returned."));
  }

  // Create the return request
  const returnRequest = await ReturnRequest.create({
    orderNumber,
    userId: req.user._id,
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      variantName: item.variantName,
    })),
    reason: reason.trim(),
  });

  // Notify Admin & Product Sellers
  try {
    const notifications = [];
    const admins = await User.find({ role: "admin" }, "_id");
    
    // Admin notification
    admins.forEach((admin) => {
      notifications.push({
        userId: admin._id,
        title: "🔄 New Return Request",
        message: `Customer ${req.user.name || req.user.email} has requested a return for order ${orderNumber}.`,
      });
    });

    // Seller notification
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product && product.seller) {
        notifications.push({
          userId: product.seller,
          title: "🔄 Product Return Requested",
          message: `Buyer requested a return for "${item.name}"${item.variantName ? ` (${item.variantName})` : ""} from order ${orderNumber}.`,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error("Error creating notifications for return request:", err);
  }

  return res.status(201).json(new ApiResponse(true, "Return request submitted successfully.", { returnRequest: returnRequest.toClient() }));
};

export const getReturnRequests = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  let filters = {};

  // If user is a seller, they only see returns associated with their products
  if (req.user.role === "seller") {
    const sellerProducts = await Product.find({ seller: req.user._id }, "_id");
    const productIds = sellerProducts.map((p) => p._id);
    filters = { "items.productId": { $in: productIds } };
  } else if (req.user.role !== "admin") {
    // If regular buyer, they only see their own return requests
    filters = { userId: req.user._id };
  }

  const [returns, totalItems] = await Promise.all([
    ReturnRequest.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"),
    ReturnRequest.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return res.json(
    new ApiResponse(true, "Return requests fetched.", {
      returns: returns.map((r) => r.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const updateReturnRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json(new ApiResponse(false, "Invalid status. Use 'approved' or 'rejected'."));
  }

  const returnRequest = await ReturnRequest.findById(id);
  if (!returnRequest) {
    return res.status(404).json(new ApiResponse(false, "Return request not found."));
  }

  const order = await Order.findOne({ orderNumber: returnRequest.orderNumber });
  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Associated order not found."));
  }

  // Check authorizations
  const isAdmin = req.user.role === "admin";
  let isSellerForItems = false;

  if (req.user.role === "seller") {
    const sellerProducts = await Product.find({ seller: req.user._id }, "_id");
    const productIds = sellerProducts.map((p) => p._id.toString());
    isSellerForItems = returnRequest.items.every((item) => productIds.includes(item.productId.toString()));
  }

  if (!isAdmin && !isSellerForItems) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to update this return request."));
  }

  returnRequest.status = status;
  await returnRequest.save();

  // If approved, update order status to Returned and payment status to refunded
  if (status === "approved") {
    order.status = "Returned";
    order.payment.status = "refunded";
    order.statusHistory.push({ status: "Returned", note: "Return request approved by merchant" });
    await order.save();

    // Restore stock counts
    for (const item of returnRequest.items) {
      if (item.variantName) {
        await Product.updateOne(
          { _id: item.productId, "variants.name": item.variantName },
          { $inc: { "variants.$.stockCount": item.quantity } }
        );
      } else {
        await Product.updateOne(
          { _id: item.productId },
          {
            $inc: { stockCount: item.quantity },
            $set: { inStock: true },
          }
        );
      }
    }
  } else {
    order.statusHistory.push({ status: order.status, note: "Return request rejected by merchant" });
    await order.save();
  }

  // Notify buyer
  try {
    await Notification.create({
      userId: returnRequest.userId,
      title: status === "approved" ? "✅ Return Approved" : "❌ Return Rejected",
      message: `Your return request for order ${order.orderNumber} was ${status} by the merchant.`,
    });
  } catch (err) {
    console.error("Error creating return notification for buyer:", err);
  }

  return res.json(new ApiResponse(true, `Return request ${status} successfully.`, { returnRequest: returnRequest.toClient() }));
};
