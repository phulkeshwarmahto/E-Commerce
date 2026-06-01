import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    membership: { type: String, default: "Silver" },
  },
  { timestamps: true },
);

userSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    membership: this.membership,
    avatarUrl: this.avatarUrl,
  };
};

export const User = mongoose.model("User", userSchema);
