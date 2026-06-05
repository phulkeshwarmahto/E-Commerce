import mongoose from "mongoose";

const stockAlertSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    variantName: { type: String, default: "" },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

stockAlertSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    productId: this.productId.toString(),
    userId: this.userId.toString(),
    variantName: this.variantName || "",
    notified: this.notified,
    createdAt: this.createdAt,
  };
};

export const StockAlert = mongoose.model("StockAlert", stockAlertSchema);
