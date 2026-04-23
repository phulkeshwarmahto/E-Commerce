import { ApiResponse } from "../utils/ApiResponse.js";
import { buildProductQuery } from "../utils/buildProductQuery.js";
import { db } from "../utils/mockDb.js";
import { ProductModel } from "../models/Product.model.js";

export const getProducts = (req, res) => {
  const products = buildProductQuery(db.products, req.query);
  res.json(
    new ApiResponse(true, "Products fetched.", {
      products,
      featured: ProductModel.featured(db.products),
    }),
  );
};

export const getProductById = (req, res) => {
  const product = db.products.find(
    (entry) => entry.id === req.params.id || entry.slug === req.params.id,
  );

  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const relatedProducts = db.products
    .filter((entry) => entry.category === product.category && entry.id !== product.id)
    .slice(0, 4);

  res.json(new ApiResponse(true, "Product fetched.", { product, relatedProducts }));
};
