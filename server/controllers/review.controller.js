import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { Order } from "../models/Order.model.js";

const resolveProduct = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Product.findById(id);
  }

  return Product.findOne({ legacyId: id });
};

export const getReviews = async (req, res) => {
  const product = await resolveProduct(req.query.productId);

  if (!product) {
    return res.json(new ApiResponse(true, "Reviews fetched.", { reviews: [] }));
  }

  const reviews = await Review.find({ productId: product._id, isApproved: true }).sort({ createdAt: -1 });
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=59");
  res.json(new ApiResponse(true, "Reviews fetched.", { reviews: reviews.map((review) => review.toClient()) }));
};

export const createReview = async (req, res) => {
  const product = await resolveProduct(req.body.productId);

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Verified purchase check — user must have bought this product
  const hasPurchased = await Order.exists({
    userId: req.user._id,
    "items.productId": product._id,
    status: { $ne: "Cancelled" },
  });

  if (!hasPurchased) {
    return res.status(403).json(
      new ApiResponse(false, "You can only review products you have purchased."),
    );
  }

  const review = await Review.findOneAndUpdate(
    { productId: product._id, userId: req.user._id },
    {
      $set: {
        name: req.user.name || req.user.email,
        rating: Number(req.body.rating || 5),
        title: req.body.title || "Customer review",
        body: req.body.body,
        media: req.body.media || [],
        isApproved: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const productReviews = await Review.find({ productId: product._id, isApproved: true });
  product.reviewCount = productReviews.length;
  product.rating =
    productReviews.reduce((sum, entry) => sum + entry.rating, 0) / Math.max(productReviews.length, 1);
  await product.save();

  // Create notifications for product's seller and all admins
  try {
    const admins = await User.find({ role: "admin" }, "_id");
    const adminIds = admins.map((a) => a._id.toString());
    
    const recipientIds = new Set(adminIds);
    if (product.seller) {
      recipientIds.add(product.seller.toString());
    }
    
    // Remove the buyer who left the review
    recipientIds.delete(req.user._id.toString());
    
    const notifications = Array.from(recipientIds).map((uid) => ({
      userId: uid,
      title: `⭐ New Review on ${product.name}`,
      message: `${req.user.name || req.user.email} rated it ${review.rating}⭐: "${review.title || "Customer review"}"`,
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Error generating review notifications:", notifErr);
  }

  res.status(201).json(new ApiResponse(true, "Review submitted.", { review: review.toClient() }));
};
