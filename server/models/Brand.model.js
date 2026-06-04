import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    copy: { type: String, required: true, trim: true },
    offer: { type: String, required: true, trim: true },
    accent: { type: String, default: "#2f5f4b", trim: true },
    image: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

brandSchema.methods.toClient = function toClient() {
  const raw = this.toObject();
  return {
    ...raw,
    id: this._id.toString(),
  };
};

export const Brand = mongoose.model("Brand", brandSchema);
