import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";

export const uploadImage = async (_req, res) => {
  const image = await cloudinaryUpload();
  res.status(201).json(new ApiResponse(true, "Upload complete.", image));
};
