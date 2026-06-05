import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

wishlistSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    products: this.products.map(p => p._id ? p.toClient() : p.toString()),
  };
};

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
