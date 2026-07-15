import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    legacyId: { type: String, unique: true, sparse: true },
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null, min: 0 },
    description: { type: String, required: true, trim: true },
    specifications: { type: Map, of: String, default: {} },
    images: { type: [imageSchema], default: [] },
    emoji: { type: String, default: "📦" },
    badge: { type: String, default: null },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    deliveryFee: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true, default: "" },
    barcode: { type: String, trim: true, default: "" },
    isPublished: { type: Boolean, default: true },
    variants: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, default: null },
        stockCount: { type: Number, default: 0 },
      }
    ],
    quantityDiscounts: [
      {
        quantity: { type: Number, min: 2, required: true },
        discountPercent: { type: Number, min: 1, max: 99, required: true },
      }
    ],
    productType: { type: String, enum: ["organic", "affiliate"], default: "organic" },
    affiliateLink: { type: String, unique: true, sparse: true, trim: true },
    source: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);
productSchema.index({ seller: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });


productSchema.methods.toClient = function toClient() {
  const raw = this.toObject({ flattenMaps: true });
  return {
    ...raw,
    id: this._id.toString(),
    specifications: raw.specifications || {},
    quantityDiscounts: raw.quantityDiscounts || [],
  };
};

export const Product = mongoose.model("Product", productSchema);
