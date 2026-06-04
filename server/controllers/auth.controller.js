import bcrypt from "bcryptjs";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken } from "../utils/generateToken.js";
import { User } from "../models/User.model.js";

export const register = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json(new ApiResponse(false, "User already exists."));
  }

  const passwordHash = await bcrypt.hash(
    req.body.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  const allowedSelfRoles = ["user", "seller"];
  const requestedRole = req.body.role || "user";
  const role = allowedSelfRoles.includes(requestedRole) ? requestedRole : "user";

  const user = await User.create({
    name: req.body.name.trim(),
    email,
    passwordHash,
    role,
    membership: "Silver",
  });

  return res.status(201).json(
    new ApiResponse(true, "Account created.", {
      user: user.toClient(),
      token: generateToken(user),
    }),
  );
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });

  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json(new ApiResponse(false, "Invalid email or password."));
  }

  return res.json(
    new ApiResponse(true, "Login successful.", {
      user: user.toClient(),
      token: generateToken(user),
    }),
  );
};

export const me = (req, res) => {
  return res.json(new ApiResponse(true, "Profile loaded.", { user: req.user.toClient() }));
};

export const googleLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json(new ApiResponse(false, "Google ID Token is required."));
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(400).json(new ApiResponse(false, `Failed to verify Google token: ${errText}`));
    }
    const payload = await response.json();

    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json(new ApiResponse(false, "Token audience mismatch."));
    }

    console.log("Google Auth Payload received:", payload);

    const email = (payload.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json(new ApiResponse(false, "Email not provided in Google account."));
    }

    let name = (payload.name || payload.given_name || "").trim();
    if (!name) {
      name = email.split("@")[0] || "Google User";
    }

    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    console.log("Extracted Auth Details -> Name:", name, "Email:", email, "Google ID:", googleId);

    let user = await User.findOne({ email });

    if (user) {
      let updated = false;
      if (!user.name) {
        user.name = name;
        updated = true;
      }
      if (role === "seller" && user.role === "user") {
        user.role = "seller";
        updated = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      const allowedRoles = ["user", "seller"];
      const requestedRole = role || "user";
      const finalRole = allowedRoles.includes(requestedRole) ? requestedRole : "user";

      user = await User.create({
        name,
        email,
        googleId,
        avatarUrl,
        role: finalRole,
        membership: "Silver",
      });
    }

    return res.json(
      new ApiResponse(true, "Google login successful.", {
        user: user.toClient(),
        token: generateToken(user),
      }),
    );
  } catch (error) {
    console.error("CRITICAL GOOGLE AUTH ERROR:", error);
    return res.status(500).json(new ApiResponse(false, `Google authentication error: ${error.message}`));
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  if (address !== undefined) {
    user.address = {
      line1: address.line1 !== undefined ? address.line1.trim() : user.address?.line1 || "",
      city: address.city !== undefined ? address.city.trim() : user.address?.city || "",
      state: address.state !== undefined ? address.state.trim() : user.address?.state || "",
      pincode: address.pincode !== undefined ? address.pincode.trim() : user.address?.pincode || "",
    };
  }

  await user.save();

  return res.json(
    new ApiResponse(true, "Profile updated successfully.", {
      user: user.toClient(),
    })
  );
};
