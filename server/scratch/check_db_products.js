import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({
  name: String,
  productType: String,
  affiliateLink: String,
  source: String,
});
const Product = mongoose.model("Product", ProductSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const countAll = await Product.countDocuments();
  const countOrganic = await Product.countDocuments({ productType: "organic" });
  const countAffiliate = await Product.countDocuments({ productType: "affiliate" });
  
  console.log(`Total products: ${countAll}`);
  console.log(`Organic products: ${countOrganic}`);
  console.log(`Affiliate products: ${countAffiliate}`);
  
  const affiliates = await Product.find({ productType: "affiliate" }).limit(5).lean();
  console.log("Sample affiliate products:", affiliates);
  
  await mongoose.disconnect();
}

run().catch(console.error);
