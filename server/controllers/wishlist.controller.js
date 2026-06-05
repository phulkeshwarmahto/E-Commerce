import { ApiResponse } from "../utils/ApiResponse.js";
import { Wishlist } from "../models/Wishlist.model.js";

export const getWishlist = async (req, res) => {
  const userId = req.user._id;

  let wishlist = await Wishlist.findOne({ userId }).populate("products");
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  return res.json(
    new ApiResponse(true, "Wishlist fetched successfully.", {
      products: wishlist.products.map((p) => p.toClient()),
    })
  );
};

export const toggleWishlistItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json(new ApiResponse(false, "productId is required."));
  }

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  const index = wishlist.products.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    wishlist.products.splice(index, 1);
  } else {
    wishlist.products.push(productId);
    isAdded = true;
  }

  await wishlist.save();
  const populated = await Wishlist.findById(wishlist._id).populate("products");

  return res.json(
    new ApiResponse(true, isAdded ? "Product added to wishlist." : "Product removed from wishlist.", {
      isAdded,
      products: populated.products.map((p) => p.toClient()),
    })
  );
};
