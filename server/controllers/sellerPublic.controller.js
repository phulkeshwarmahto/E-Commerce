import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Product } from "../models/Product.model.js";

export const getSellerPublicProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await User.findOne({ _id: id, role: "seller" });
    if (!seller) {
      return res.status(404).json(new ApiResponse(false, "Seller not found."));
    }

    // Calculate seller product count and ratings
    const products = await Product.find({ seller: id });
    const reviewCount = products.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
    const totalRating = products.reduce((sum, p) => sum + (p.rating || 0) * (p.reviewCount || 0), 0);
    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

    return res.json(
      new ApiResponse(true, "Seller profile fetched.", {
        seller: {
          id: seller._id.toString(),
          name: seller.name,
          avatarUrl: seller.avatarUrl,
          certificationStatus: seller.certificationStatus || "new",
          creditScore: seller.creditScore ?? 750,
          averageRating,
          totalProducts: products.length,
        },
      })
    );
  } catch (err) {
    console.error("Error fetching seller public profile:", err);
    return res.status(500).json(new ApiResponse(false, "Internal server error."));
  }
};
