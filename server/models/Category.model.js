import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    emoji: { type: String, default: "📦" },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

categorySchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    name: this.name,
    emoji: this.emoji,
    slug: this.slug,
  };
};

export const Category = mongoose.model("Category", categorySchema);
