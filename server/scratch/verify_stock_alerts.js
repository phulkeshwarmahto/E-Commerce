import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { StockAlert } from "../models/StockAlert.model.js";
import { Notification } from "../models/Notification.model.js";
import { processStockAlerts } from "../utils/stockAlertHelper.js";

dotenv.config();

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Clean up any old test data
  let user = await User.findOne({ email: "stock_tester@GaramBazaar.com" });
  if (user) {
    await User.deleteOne({ _id: user._id });
  }
  user = await User.create({
    name: "Stock Tester",
    email: "stock_tester@GaramBazaar.com",
    role: "user",
    isVerified: true
  });
  console.log(`Created test user: ${user.name}`);

  let product = await Product.findOne({ name: "Out of Stock Honey" });
  if (product) {
    await Product.deleteOne({ _id: product._id });
  }
  product = await Product.create({
    name: "Out of Stock Honey",
    slug: "out-of-stock-honey",
    price: 150,
    category: "Pantry",
    description: "Delicious pure wild honey",
    inStock: false,
    stockCount: 0,
    seller: user._id
  });
  console.log(`Created test out-of-stock product: ${product.name}`);

  // Test Case 1: Register alert and trigger replenishment
  console.log("\n--- TEST CASE 1: Register and Process Stock Alert ---");
  
  // Register Stock Alert
  const alert = await StockAlert.create({
    productId: product._id,
    userId: user._id,
  });
  console.log(`Created stock alert for user ${user.name}`);

  // Replenish stock
  product.inStock = true;
  product.stockCount = 5;
  await product.save();
  console.log("Replenished product stock. Product.inStock:", product.inStock, "stockCount:", product.stockCount);

  // Process alerts
  console.log("Running processStockAlerts...");
  await processStockAlerts(product._id);

  // Verify notification
  const notification = await Notification.findOne({ userId: user._id });
  const alertCount = await StockAlert.countDocuments({ productId: product._id });

  if (notification) {
    console.log("✅ In-app Notification successfully generated:", notification.title);
    console.log("Notification message:", notification.message);
  } else {
    console.error("❌ Failed to generate Notification!");
  }

  if (alertCount === 0) {
    console.log("✅ Stock alert successfully processed and deleted from the database!");
  } else {
    console.error("❌ Stock alert still exists in the database!");
  }

  if (notification && alertCount === 0) {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Cleanup
  await User.deleteOne({ _id: user._id });
  await Product.deleteOne({ _id: product._id });
  await Notification.deleteMany({ userId: user._id });
  console.log("\nCleaned up test documents.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
