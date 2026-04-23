import { ApiResponse } from "../utils/ApiResponse.js";
import { db } from "../utils/mockDb.js";
import { generateToken } from "../utils/generateToken.js";
import { UserModel } from "../models/User.model.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  membership: user.membership,
});

export const register = (req, res) => {
  const existingUser = UserModel.findByEmail(db.users, req.body.email);

  if (existingUser) {
    return res.status(409).json(new ApiResponse(false, "User already exists."));
  }

  const user = {
    id: `user-${Date.now()}`,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: "user",
    membership: "Silver",
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);

  return res.status(201).json(
    new ApiResponse(true, "Account created.", {
      user: sanitizeUser(user),
      token: generateToken(user),
    }),
  );
};

export const login = (req, res) => {
  const user = UserModel.findByEmail(db.users, req.body.email);

  if (!user || user.password !== req.body.password) {
    return res.status(401).json(new ApiResponse(false, "Invalid email or password."));
  }

  return res.json(
    new ApiResponse(true, "Login successful.", {
      user: sanitizeUser(user),
      token: generateToken(user),
    }),
  );
};

export const me = (req, res) => {
  const user = db.users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  return res.json(new ApiResponse(true, "Profile loaded.", { user: sanitizeUser(user) }));
};
