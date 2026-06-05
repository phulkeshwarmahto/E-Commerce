import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/Cart.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Notification } from "../models/Notification.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const SHIPPING_FREE_THRESHOLD = Number(process.env.SHIPPING_FREE_THRESHOLD || 500);
const SHIPPING_FEE = Number(process.env.SHIPPING_FEE || 49);

const resolveProductId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return id;
  }

  const product = await Product.findOne({ legacyId: id });
  return product?._id;
};

const calculateDiscount = async (couponCode, orderItems) => {
  if (!couponCode) {
    return { discount: 0, couponCode: "" };
  }

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
  const expired = coupon?.expiresAt && coupon.expiresAt.getTime() < Date.now();

  if (!coupon || expired) {
    return { discount: 0, couponCode: "" };
  }

  // Calculate subtotal of items that are eligible for this coupon
  let eligibleSubtotal = 0;
  if (coupon.sellerId) {
    // Seller-specific coupon: only sum subtotal of products from this seller
    orderItems.forEach((item) => {
      if (item.product.seller?.toString() === coupon.sellerId.toString()) {
        eligibleSubtotal += item.subtotal;
      }
    });
  } else {
    // Platform-wide coupon: all products are eligible
    eligibleSubtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Check minOrderAmount against eligible subtotal
  if (eligibleSubtotal < coupon.minOrderAmount || eligibleSubtotal === 0) {
    return { discount: 0, couponCode: "" };
  }

  const discount =
    coupon.discountType === "percent"
      ? Math.round((eligibleSubtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  return {
    discount: Math.min(discount, eligibleSubtotal),
    couponCode: coupon.code,
  };
};

const buildOrderItems = async (rawItems) => {
  const items = [];

  for (const item of rawItems) {
    const productId = await resolveProductId(item.productId);
    const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 99));

    if (!productId) {
      throw new Error("One or more products were not found.");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("One or more products were not found.");
    }

    if (item.variantName) {
      const variant = product.variants.find((v) => v.name === item.variantName);
      if (!variant || variant.stockCount < quantity) {
        throw new Error(`Product "${product.name}" (${item.variantName}) is out of stock or unavailable in the requested quantity.`);
      }
      items.push({
        product,
        quantity,
        variantName: item.variantName,
        price: variant.price,
        subtotal: variant.price * quantity,
      });
    } else {
      if (!product.inStock || product.stockCount < quantity) {
        throw new Error(`Product "${product.name}" is out of stock or unavailable in the requested quantity.`);
      }
      items.push({
        product,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }
  }

  return items;
};

export const getOrders = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const filters = { userId: req.user._id };

  const [orders, totalItems] = await Promise.all([
    Order.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Orders fetched.", {
      orders: orders.map((order) => order.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  );
};

export const createOrder = async (req, res) => {
  const orderItems = await buildOrderItems(req.body.items);
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingFee = orderItems.reduce((sum, item) => sum + (item.product.deliveryFee || 0) * item.quantity, 0);
  const { discount, couponCode } = await calculateDiscount(req.body.couponCode, orderItems);
  const total = Math.max(subtotal + shippingFee - discount, 0);
  const paymentMethod = req.body.paymentMethod || "cod";
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const order = await Order.create({
    orderNumber,
    userId: req.user._id,
    items: orderItems.map(({ product, quantity, variantName, price }) => ({
      productId: product._id,
      name: product.name,
      price,
      quantity,
      emoji: product.emoji,
      image: product.images?.[0]?.url || "",
      variantName,
    })),
    shippingAddress: req.body.shippingAddress,
    payment: {
      method: paymentMethod,
      status: "pending",
    },
    subtotal,
    shippingFee,
    discount,
    couponCode,
    total,
    status: "Processing",
    statusHistory: [{ status: "Processing", note: "Order created" }],
    deliverySlot: req.body.deliverySlot || "",
    estimatedDeliveryDate: req.body.estimatedDeliveryDate ? new Date(req.body.estimatedDeliveryDate) : undefined,
  });

  // Decrement stock levels
  for (const item of orderItems) {
    if (item.variantName) {
      await Product.updateOne(
        { _id: item.product._id, "variants.name": item.variantName },
        {
          $inc: { "variants.$.stockCount": -item.quantity },
        }
      );
    } else {
      await Product.updateOne(
        { _id: item.product._id },
        {
          $inc: { stockCount: -item.quantity },
          $set: { inStock: item.product.stockCount - item.quantity > 0 },
        },
      );
    }

    // Trigger low stock check
    try {
      const refreshedProduct = await Product.findById(item.product._id);
      let isLow = false;
      let remaining = 0;

      if (item.variantName) {
        const matchingVariant = refreshedProduct.variants.find((v) => v.name === item.variantName);
        if (matchingVariant && matchingVariant.stockCount < 5) {
          isLow = true;
          remaining = matchingVariant.stockCount;
        }
      } else {
        if (refreshedProduct.stockCount < 5) {
          isLow = true;
          remaining = refreshedProduct.stockCount;
        }
      }

      if (isLow && refreshedProduct.seller) {
        await Notification.create({
          userId: refreshedProduct.seller,
          title: "⚠️ Low Stock Warning",
          message: `Your product "${refreshedProduct.name}" ${item.variantName ? `(${item.variantName}) ` : ""}is running low. Only ${remaining} units remaining. Please replenish stock!`,
        });
      }
    } catch (err) {
      console.error("Error triggering low stock warning notification:", err);
    }
  }

  await Cart.findOneAndUpdate({ userId: req.user._id }, { $set: { items: [] } }, { upsert: true });

  // Notify product sellers of the new order purchase
  try {
    const notifications = [];
    for (const item of orderItems) {
      if (item.product.seller) {
        notifications.push({
          userId: item.product.seller,
          title: "📦 New Store Order Placed",
          message: `Hurray! Customer ${req.user.name || req.user.email} has purchased your product "${item.product.name}"${item.variantName ? ` (${item.variantName})` : ""} (Qty: ${item.quantity}). Order Ref: ${order.orderNumber}. Prepare the item for shipment!`,
        });
      }
    }
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Error creating notifications for sellers on order placement:", notifErr);
  }

  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order ${order.orderNumber} confirmed`,
      text: `Your GramBazaar order ${order.orderNumber} has been placed.`,
    });
  } catch (emailError) {
    console.error("Gracefully caught mail sending failure:", emailError.message);
  }

  res.status(201).json(new ApiResponse(true, "Order placed.", { order: order.toClient() }));
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ orderNumber: id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  const isOwner = order.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json(new ApiResponse(false, "Unauthorized to cancel this order."));
  }

  if (order.status !== "Processing") {
    return res.status(400).json(new ApiResponse(false, `Cannot cancel order in "${order.status}" status.`));
  }

  // Restore stock counts
  for (const item of order.items) {
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

  order.status = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", note: `Cancelled by ${isAdmin ? "administrator" : "buyer"}` });
  await order.save();

  // Notify sellers
  try {
    const notifications = [];
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && product.seller) {
        notifications.push({
          userId: product.seller,
          title: "❌ Order Cancelled",
          message: `Order ${order.orderNumber} containing "${item.name}"${item.variantName ? ` (${item.variantName})` : ""} was cancelled by the ${isAdmin ? "administrator" : "buyer"}.`,
        });
      }
    }
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error("Failed to notify sellers on cancellation:", err);
  }

  return res.json(new ApiResponse(true, "Order cancelled successfully.", { order: order.toClient() }));
};
