import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/Product.model.js";
import { User } from "./models/User.model.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const productCount = await Product.countDocuments();
  console.log("Total Products:", productCount);

  const userCount = await User.countDocuments();
  console.log("Total Users:", userCount);

  const sampleProducts = await Product.find().populate("seller").limit(10);
  console.log("Sample Products with Sellers:");
  sampleProducts.forEach(p => {
    console.log(`- ID: ${p._id}, Name: ${p.name}, Price: ${p.price}, Seller ID: ${p.seller?._id || "none"}, Seller Name: ${p.seller?.name || "none"}, Seller Role: ${p.seller?.role || "none"}`);
  });

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
