import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../utils/mockDb.js";

export const getReviews = (req, res) => {
  const reviews = db.reviews.filter((review) => review.productId === req.query.productId);
  res.json(new ApiResponse(true, "Reviews fetched.", { reviews }));
};

export const createReview = (req, res) => {
  const review = {
    id: `review-${Date.now()}`,
    productId: req.body.productId,
    userId: req.user.id,
    name: req.user.email,
    rating: Number(req.body.rating || 5),
    title: req.body.title || "Customer review",
    body: req.body.body,
    media: req.body.media || [],
    isApproved: true,
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(review);

  const productReviews = db.reviews.filter((entry) => entry.productId === req.body.productId);
  const product = db.products.find((entry) => entry.id === req.body.productId);

  if (product) {
    product.reviewCount = productReviews.length;
    product.rating =
      productReviews.reduce((sum, entry) => sum + entry.rating, 0) / productReviews.length;
    product.updatedAt = new Date().toISOString();
  }

  res.status(201).json(new ApiResponse(true, "Review submitted.", { review }));
};
