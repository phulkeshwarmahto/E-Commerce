import mongoose from "mongoose";

const returnRequestItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variantName: { type: String },
  },
  { _id: false },
);

const returnRequestSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [returnRequestItemSchema], required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

returnRequestSchema.methods.toClient = function toClient() {
  const raw = this.toObject();
  return {
    ...raw,
    id: this._id.toString(),
    userId: this.userId.toString(),
    items: raw.items.map((item) => ({
      ...item,
      productId: item.productId.toString(),
    })),
  };
};

export const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
