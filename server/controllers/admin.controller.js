import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/Coupon.model.js";
import { ORDER_STATUSES, Order } from "../models/Order.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { Brand } from "../models/Brand.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { slugify } from "../utils/slugify.js";

export const getDashboard = async (_req, res) => {
  const [revenueResult, orders, productCount, userCount, products, recentOrders, topProducts, reviews] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Product.find().populate("seller", "name email").sort({ createdAt: -1 }).limit(100),
      Order.find().sort({ createdAt: -1 }).limit(10),
      Product.find().populate("seller", "name email").sort({ rating: -1 }).limit(5),
      Review.find().sort({ createdAt: -1 }).limit(5),
      Coupon.countDocuments(),
    ]);

  res.json(
    new ApiResponse(true, "Dashboard fetched.", {
      stats: {
        revenue: revenueResult[0]?.revenue || 0,
        orders,
        products: productCount,
        users: userCount,
      },
      products: products.map((product) => product.toClient()),
      recentOrders: recentOrders.map((order) => order.toClient()),
      topProducts: topProducts.map((product) => product.toClient()),
      reviews: reviews.map((review) => review.toClient()),
    }),
  );
};

export const updateOrderStatus = async (req, res) => {
  if (!ORDER_STATUSES.includes(req.body.status)) {
    return res.status(400).json(new ApiResponse(false, "Invalid order status."));
  }

  const order = await Order.findOne({ orderNumber: req.params.id });

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  order.status = req.body.status;
  order.statusHistory.push({
    status: req.body.status,
    updatedAt: new Date(),
    note: "Updated from admin",
  });
  await order.save();

  res.json(new ApiResponse(true, "Order updated.", { order: order.toClient() }));
};

export const createProduct = async (req, res) => {
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
    deliveryFee: req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : 0,
  });

  res.status(201).json(new ApiResponse(true, "Product created.", { product: product.toClient() }));
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
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
  res.json(new ApiResponse(true, "Product updated.", { product: product.toClient() }));
};

export const getUsers = async (_req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json(new ApiResponse(true, "Users fetched.", { users: users.map((u) => u.toClient()) }));
};

export const updateUserCreditScore = async (req, res) => {
  const { score } = req.body;
  const scoreNum = Number(score);

  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 1000) {
    return res.status(400).json(new ApiResponse(false, "Invalid credit score. Must be between 0 and 1000."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.creditScore = scoreNum;
  await user.save();

  res.json(new ApiResponse(true, "Credit score updated.", { user: user.toClient() }));
};

export const updateUserCertification = async (req, res) => {
  const { certificationStatus } = req.body;

  if (!["new", "certified"].includes(certificationStatus)) {
    return res.status(400).json(new ApiResponse(false, "Invalid certification status."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.certificationStatus = certificationStatus;
  await user.save();

  res.json(new ApiResponse(true, "Certification status updated.", { user: user.toClient() }));
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!["user", "seller", "admin"].includes(role)) {
    return res.status(400).json(new ApiResponse(false, "Invalid user role."));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.role = role;
  await user.save();

  res.json(new ApiResponse(true, "User role updated.", { user: user.toClient() }));
};

export const sendNotification = async (req, res) => {
  const { userId, title, message, sendEmailCheckbox } = req.body;

  if (!userId || !title || !message) {
    return res.status(400).json(new ApiResponse(false, "userId, title, and message are required."));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
  });

  let emailSent = false;
  if (sendEmailCheckbox) {
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Message from GramBazaar Admin</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hello ${user.name || "User"},</p>
            <div style="background-color: #fcf8f2; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; font-style: italic; color: #555;">
              ${message.replace(/\n/g, "<br/>")}
            </div>
            <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
              This is a personalized notification sent from the GramBazaar Administrator Panel. Please do not reply directly to this automated email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      if (req.log) {
        req.log.error(err, "Failed to send admin email notification");
      } else {
        console.error("Email send failed:", err);
      }
    }
  }

  res.json(
    new ApiResponse(true, "Notification sent successfully.", {
      notification: notification.toClient(),
      emailSent,
    })
  );
};

export const getCouponsAdmin = async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "All coupons fetched.", { coupons }));
};

export const createCouponAdmin = async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, expiresAt, active } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json(new ApiResponse(false, "Code, discount type, and value are required."));
  }

  const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (exists) {
    return res.status(400).json(new ApiResponse(false, "Coupon code already exists."));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount || 0),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    active: active ?? true,
  });

  res.status(201).json(new ApiResponse(true, "Coupon created successfully.", { coupon }));
};

export const deleteCouponAdmin = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    return res.status(404).json(new ApiResponse(false, "Coupon not found."));
  }
  res.json(new ApiResponse(true, "Coupon deleted successfully."));
};

export const getBrandsAdmin = async (_req, res) => {
  const brands = await Brand.find().sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "All brands fetched.", { brands: brands.map((b) => b.toClient()) }));
};

export const createBrandAdmin = async (req, res) => {
  const { brand, title, copy, offer, accent, image, active } = req.body;

  if (!brand || !title || !copy || !offer || !image) {
    return res.status(400).json(new ApiResponse(false, "Brand, title, copy, offer, and image are required."));
  }

  const brandDoc = await Brand.create({
    brand: brand.trim(),
    title: title.trim(),
    copy: copy.trim(),
    offer: offer.trim(),
    accent: accent ? accent.trim() : "#2f5f4b",
    image: image.trim(),
    active: active ?? true,
  });

  res.status(201).json(new ApiResponse(true, "Brand spotlight created successfully.", { brand: brandDoc.toClient() }));
};

export const deleteBrandAdmin = async (req, res) => {
  const brandDoc = await Brand.findByIdAndDelete(req.params.id);
  if (!brandDoc) {
    return res.status(404).json(new ApiResponse(false, "Brand spotlight not found."));
  }
  res.json(new ApiResponse(true, "Brand spotlight deleted successfully."));
};

