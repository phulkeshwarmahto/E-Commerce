export const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: error.message || "Server error." });
};
