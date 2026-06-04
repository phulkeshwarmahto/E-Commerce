import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";

export const uploadImage = async (req, res) => {
  const image = await cloudinaryUpload(req.file);
  res.status(201).json(new ApiResponse(true, "Upload complete.", image));
};

export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json(new ApiResponse(false, "No images were provided."));
  }

  const images = await Promise.all(req.files.map((file) => cloudinaryUpload(file)));
  res.status(201).json(new ApiResponse(true, "Upload complete.", { images }));
};
