import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";

const buildMongoQuery = (query = {}) => {
  const search = (query.search || "").trim();
  const category = query.category || "All";
  const featured = query.featured === "true";
  const badge = (query.badge || "").trim().toLowerCase();
  const seller = query.seller || "";
  const filters = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (category !== "All") {
    filters.category = category;
  }

  if (featured) {
    filters.isFeatured = true;
  }

  if (badge) {
    filters.badge = badge;
  }

  if (seller) {
    filters.seller = seller;
  }

  const priceMin = parseFloat(query.priceMin);
  const priceMax = parseFloat(query.priceMax);
  if (!isNaN(priceMin) || !isNaN(priceMax)) {
    filters.price = {};
    if (!isNaN(priceMin)) {
      filters.price.$gte = priceMin;
    }
    if (!isNaN(priceMax)) {
      filters.price.$lte = priceMax;
    }
  }

  return filters;
};

export const getProducts = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 12));
  const skip = (page - 1) * limit;

  const mongoQuery = buildMongoQuery(req.query);

  const [products, totalItems, featured] = await Promise.all([
    Product.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(mongoQuery),
    Product.find({ isFeatured: true }).sort({ rating: -1 }).limit(12),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=59");
  res.json(
    new ApiResponse(true, "Products fetched.", {
      products: products.map((product) => product.toClient()),
      featured: featured.map((product) => product.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    }),
  );
};

export const getProductById = async (req, res) => {
  const lookup = req.params.id.match(/^[a-f\d]{24}$/i)
    ? { $or: [{ _id: req.params.id }, { slug: req.params.id }, { legacyId: req.params.id }] }
    : { $or: [{ slug: req.params.id }, { legacyId: req.params.id }] };
  const product = await Product.findOne(lookup).populate("seller", "name certificationStatus creditScore");

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ rating: -1 })
    .limit(4);

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=59");
  res.json(
    new ApiResponse(true, "Product fetched.", {
      product: product.toClient(),
      relatedProducts: relatedProducts.map((entry) => entry.toClient()),
    }),
  );
};
