export const validate = (rules = []) => (req, res, next) => {
  const errors = rules
    .map((rule) => rule(req))
    .filter(Boolean);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  next();
};
