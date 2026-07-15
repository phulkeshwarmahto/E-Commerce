import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

dotenv.config({ override: true });

async function checkSlug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const product = await Product.findOne({ slug: "ytdl-max-high-speed-video-downloader" });
    console.log("Product:", JSON.stringify(product, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
checkSlug();
