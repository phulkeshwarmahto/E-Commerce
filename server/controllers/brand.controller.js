import { ApiResponse } from "../utils/ApiResponse.js";
import { Brand } from "../models/Brand.model.js";

export const getBrands = async (req, res) => {
  const brands = await Brand.find({ active: true }).sort({ createdAt: -1 });
  res.json(new ApiResponse(true, "Brands fetched.", { brands: brands.map((b) => b.toClient()) }));
};
