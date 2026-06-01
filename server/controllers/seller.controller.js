import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import { ProductFAQ } from "../models/ProductFAQ.model.js";
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

  Object.assign(product, {
    ...req.body,
    slug: req.body.slug || product.slug,
    price: Number(req.body.price ?? product.price),
    originalPrice:
      req.body.originalPrice === null || req.body.originalPrice === ""
        ? null
        : Number(req.body.originalPrice ?? product.originalPrice),
    stockCount: Number(req.body.stockCount ?? product.stockCount),
  });

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
