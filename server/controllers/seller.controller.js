import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { ORDER_STATUSES, PAYMENT_STATUSES, Order } from "../models/Order.model.js";
import { ProductFAQ } from "../models/ProductFAQ.model.js";
import { Notification } from "../models/Notification.model.js";
import { slugify } from "../utils/slugify.js";

export const getSellerDashboard = async (req, res) => {
  const sellerId = req.user._id;

  // 1. Get all seller products
  const products = await Product.find({ seller: sellerId }).sort({ createdAt: -1 });
  const productIds = products.map((p) => p._id);

  // 2. Get all orders containing any of the seller's products
  const orders = await Order.find({ "items.productId": { $in: productIds } }).sort({ createdAt: -1 });

  // 3. Compute seller specific stats
  let sellerRevenue = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (productIds.some((pId) => pId.toString() === item.productId.toString())) {
        sellerRevenue += item.price * item.quantity;
      }
    });
  });

  return res.json(
    new ApiResponse(true, "Seller dashboard fetched.", {
      stats: {
        revenue: sellerRevenue,
        products: products.length,
        orders: orders.length,
      },
      products: products.map((product) => product.toClient()),
      recentOrders: orders.map((order) => order.toClient()),
    }),
  );
};

export const getSellerFAQs = async (req, res) => {
  const sellerId = req.user._id;

  // 1. Find all seller product IDs
  const products = await Product.find({ seller: sellerId });
  const productIds = products.map((p) => p._id);

  // 2. Find FAQs for these products
  const faqs = await ProductFAQ.find({ productId: { $in: productIds } }).sort({ createdAt: -1 });

  return res.json(new ApiResponse(true, "Seller FAQs fetched.", { faqs: faqs.map((faq) => faq.toClient()) }));
};

export const createSellerProduct = async (req, res) => {
  const sellerId = req.user._id;

  const product = await Product.create({
    slug: req.body.slug || slugify(req.body.name),
    name: req.body.name,
    category: req.body.category,
    price: Number(req.body.price),
    originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
    description: req.body.description,
    specifications: req.body.specifications || {},
    images: req.body.images || [],
    emoji: req.body.emoji || "📦",
    badge: req.body.badge || null,
    inStock: req.body.inStock ?? true,
    stockCount: Number(req.body.stockCount || 0),
    rating: 0,
    reviewCount: 0,
    tags: req.body.tags || [],
    isFeatured: Boolean(req.body.isFeatured),
    seller: sellerId,
    deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 0,
  });

  return res.status(201).json(new ApiResponse(true, "Product created.", { product: product.toClient() }));
};

export const updateSellerProduct = async (req, res) => {
  const sellerId = req.user._id;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Authorize: Product must belong to the seller, or user is an admin
  if (product.seller?.toString() !== sellerId.toString() && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to update this product."));
  }

  // Only pick mutable fields — never assign _id, __v, seller (populated), etc.
  const { name, category, description, badge, emoji, images, tags, isFeatured, inStock } = req.body;

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (badge !== undefined) product.badge = badge || null;
  if (emoji !== undefined) product.emoji = emoji;
  if (images !== undefined) product.images = images;
  if (tags !== undefined) product.tags = tags;
  if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
  if (inStock !== undefined) product.inStock = Boolean(inStock);

  if (req.body.slug) product.slug = req.body.slug;
  product.price = Number(req.body.price ?? product.price);
  product.originalPrice =
    req.body.originalPrice === null || req.body.originalPrice === ""
      ? null
      : Number(req.body.originalPrice ?? product.originalPrice);
  product.stockCount = Number(req.body.stockCount ?? product.stockCount);
  product.deliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : product.deliveryFee;

  await product.save();
  return res.json(new ApiResponse(true, "Product updated.", { product: product.toClient() }));
};

export const deleteSellerProduct = async (req, res) => {
  const sellerId = req.user._id;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Authorize: Product must belong to the seller, or user is an admin
  if (product.seller?.toString() !== sellerId.toString() && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to delete this product."));
  }

  await Product.findByIdAndDelete(req.params.id);
  return res.json(new ApiResponse(true, "Product deleted."));
};

export const updateSellerOrderStatus = async (req, res) => {
  const sellerId = req.user._id;
  const { status, paymentStatus } = req.body;

  if (status && !ORDER_STATUSES.includes(status)) {
    return res.status(400).json(new ApiResponse(false, "Invalid order status."));
  }

  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json(new ApiResponse(false, "Invalid payment status."));
  }

  const order = await Order.findOne({ orderNumber: req.params.id });
  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  // Find all products owned by this seller
  const sellerProducts = await Product.find({ seller: sellerId });
  const sellerProductIds = sellerProducts.map((p) => p._id.toString());

  // Check if at least one item in the order is owned by this seller
  const hasMerchantProduct = order.items.some((item) =>
    sellerProductIds.includes(item.productId.toString())
  );

  // If not owned by this seller, check if the user is an admin
  if (!hasMerchantProduct && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to update this order."));
  }

  if (status) {
    order.status = status;
  }
  if (paymentStatus) {
    order.payment.status = paymentStatus;
  }

  let buyerMessage = "";
  if (status) {
    if (status === "On the Way") {
      buyerMessage = `🚚 Hurray! Your order #${order.orderNumber} is on the way! It's on time. Track details in your dashboard.`;
    } else if (status === "Delivered") {
      buyerMessage = `🥳 Order Delivered! Your organic everyday essentials for order #${order.orderNumber} have arrived safely. Thank you for shopping with us!`;
    } else if (status === "Cancelled") {
      buyerMessage = `⚠️ Order Cancelled. Your order #${order.orderNumber} has been cancelled. Please contact support if you need refund help.`;
    } else if (status === "Returned") {
      buyerMessage = `↩️ Return Processed. The return request for order #${order.orderNumber} has been processed successfully.`;
    } else {
      buyerMessage = `📦 Your order #${order.orderNumber} status has been updated to "${status}".`;
    }
  }

  if (paymentStatus) {
    let paymentFriendly = paymentStatus === "paid" ? "Paid on Delivery" : paymentStatus === "failed" ? "Cancelled" : paymentStatus === "refunded" ? "Returned" : "Pending";
    if (buyerMessage) {
      buyerMessage += ` | Payment Status: ${paymentFriendly}.`;
    } else {
      buyerMessage = `💳 Your order #${order.orderNumber} payment status has been updated to "${paymentFriendly}".`;
    }
  }

  order.statusHistory.push({
    status: status || order.status,
    updatedAt: new Date(),
    note: buyerMessage,
  });
  await order.save();

  try {
    await Notification.create({
      userId: order.userId,
      title: `🔔 Order Update: ${status || "Payment Update"}`,
      message: buyerMessage,
    });
  } catch (notifErr) {
    console.error("Error creating order status update notification for buyer (seller action):", notifErr);
  }

  return res.json(new ApiResponse(true, "Order status updated.", { order: order.toClient() }));
};
