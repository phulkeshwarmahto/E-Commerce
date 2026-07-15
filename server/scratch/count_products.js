import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

dotenv.config({ override: true });

async function checkProducts() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected Host:", mongoose.connection.host);
    console.log("Connected DB Name:", mongoose.connection.name);
    const count = await Product.countDocuments();
    console.log("Total Products in DB:", count);
    
    const affiliates = await Product.find({ productType: "affiliate" });
    console.log("Affiliate Products Count:", affiliates.length);
    affiliates.forEach(p => console.log(`- ${p.name} (${p.category}) - ${p.productType} - Published: ${p.isPublished}`));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkProducts();
