export const validate = (schema) => (req, res, next) => {
  if (!schema) {
    return next();
  }

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors[0]?.message || "Validation failed.";
    return res.status(400).json({ success: false, message: errorMsg });
  }

  req.body = result.data;
  next();
};
