import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES || 2 * 1024 * 1024),
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed."));
      return;
    }

    callback(null, true);
  },
};

export const upload = multer(multerConfig).single("image");
export const uploadMultiple = multer(multerConfig).array("images", 10);
