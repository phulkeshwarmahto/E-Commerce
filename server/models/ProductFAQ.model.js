import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "", trim: true },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answeredByName: { type: String, default: "" },
    isAnswered: { type: Boolean, default: false },
  },
  { timestamps: true },
);

faqSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    productId: this.productId.toString(),
    buyerId: this.buyerId.toString(),
    buyerName: this.buyerName,
    question: this.question,
    answer: this.answer,
    answeredBy: this.answeredBy ? this.answeredBy.toString() : null,
    answeredByName: this.answeredByName,
    isAnswered: this.isAnswered,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ProductFAQ = mongoose.model("ProductFAQ", faqSchema);
