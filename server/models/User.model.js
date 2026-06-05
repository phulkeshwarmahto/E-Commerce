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
    certificationStatus: { type: String, enum: ["new", "certified"], default: "new" },
    creditScore: { type: Number, default: 750 },
    phone: { type: String, trim: true, default: "" },
    address: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    isBanned: { type: Boolean, default: false },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
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
    certificationStatus: this.certificationStatus || "new",
    creditScore: this.creditScore ?? 750,
    phone: this.phone || "",
    address: this.address || { line1: "", city: "", state: "", pincode: "" },
  };
};

export const User = mongoose.model("User", userSchema);
