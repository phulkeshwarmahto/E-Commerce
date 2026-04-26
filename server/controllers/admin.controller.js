import { ApiResponse } from "../utils/ApiResponse.js";
import { db, saveProducts } from "../utils/mockDb.js";

export const getDashboard = (_req, res) => {
  const revenue = db.orders.reduce((sum, order) => sum + order.total, 0);

  res.json(
    new ApiResponse(true, "Dashboard fetched.", {
      stats: {
        revenue,
        orders: db.orders.length,
        products: db.products.length,
        users: db.users.length,
      },
      products: db.products,
      recentOrders: db.orders.slice(0, 5),
      topProducts: [...db.products].sort((a, b) => b.rating - a.rating).slice(0, 5),
      reviews: db.reviews.slice(0, 5),
    }),
  );
};

export const updateOrderStatus = (req, res) => {
  const order = db.orders.find((entry) => entry.id === req.params.id);

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  order.status = req.body.status;
  order.statusHistory.push({
    status: req.body.status,
    updatedAt: new Date().toISOString(),
    note: "Updated from admin",
  });

  res.json(new ApiResponse(true, "Order updated.", { order }));
};

export const createProduct = (req, res) => {
  const product = {
    id: `prod-${Date.now()}`,
    slug: req.body.name.toLowerCase().replaceAll(" ", "-"),
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
    stockCount: Number(req.body.stockCount || 12),
    rating: 4.2,
    reviewCount: 0,
    tags: req.body.tags || [],
    isFeatured: Boolean(req.body.isFeatured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products.unshift(product);
  saveProducts();
  res.status(201).json(new ApiResponse(true, "Product created.", { product }));
};

export const updateProduct = (req, res) => {
  const product = db.products.find((entry) => entry.id === req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  Object.assign(product, {
    ...req.body,
    price: Number(req.body.price ?? product.price),
    originalPrice:
      req.body.originalPrice === null || req.body.originalPrice === ""
        ? null
        : Number(req.body.originalPrice ?? product.originalPrice),
    updatedAt: new Date().toISOString(),
  });

  saveProducts();
  res.json(new ApiResponse(true, "Product updated.", { product }));
};
