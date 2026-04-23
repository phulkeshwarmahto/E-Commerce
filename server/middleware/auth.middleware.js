import { parseToken } from "../utils/generateToken.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  const user = parseToken(token);

  if (!user) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  req.user = user;
  next();
};
