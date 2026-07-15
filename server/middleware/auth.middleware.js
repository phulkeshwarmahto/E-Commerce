import { User } from "../models/User.model.js";
import { parseToken } from "../utils/generateToken.js";

export const requireAuth = async (req, res, next) => {
  let token = req.cookies?.token || "";
  if (!token) {
    const header = req.headers.authorization || "";
    token = header.startsWith("Bearer ") ? header.slice(7) : "";
  }
  if (!token && req.query.token) {
    token = req.query.token;
  }
  const tokenUser = parseToken(token);

  if (!tokenUser?.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const user = await User.findById(tokenUser.id);

  if (!user) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  if (user.isBanned) {
    return res.status(403).json({ success: false, message: "Your account has been suspended by an administrator." });
  }

  req.user = user;
  next();
};

export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token || "";
  if (!token) {
    const header = req.headers.authorization || "";
    token = header.startsWith("Bearer ") ? header.slice(7) : "";
  }
  if (!token) {
    return next();
  }
  try {
    const tokenUser = parseToken(token);
    if (tokenUser?.id) {
      const user = await User.findById(tokenUser.id);
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token
  }
  next();
};

