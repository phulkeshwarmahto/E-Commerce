import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    shippingFee: { type: Number, default: 49 },
    shippingFreeThreshold: { type: Number, default: 500 },
    homepageBanners: [
      {
        imageUrl: { type: String, required: true },
        linkUrl: { type: String, default: "/shop" },
        title: { type: String, default: "" },
      }
    ],
  },
  { timestamps: true }
);

settingsSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    shippingFee: this.shippingFee ?? 49,
    shippingFreeThreshold: this.shippingFreeThreshold ?? 500,
    homepageBanners: this.homepageBanners || [],
  };
};

export const Settings = mongoose.model("Settings", settingsSchema);
