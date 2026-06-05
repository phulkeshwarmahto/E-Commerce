import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { Order } from "../models/Order.model.js";

dotenv.config({ path: "server/.env" });

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Create a temporary test user
  const email = `test_loyalty_${Date.now()}@grambazaar.com`;
  const testUser = await User.create({
    name: "Loyalty Tester",
    email,
    loyaltyPoints: 0,
    membership: "Silver",
    role: "user",
    isVerified: true
  });
  console.log(`Created test user: ${testUser.name} (${testUser.email}), Initial Points: ${testUser.loyaltyPoints}, Tier: ${testUser.membership}`);

  // Helper to calculate loyalty discount locally
  const getLoyaltyDiscount = (subtotal, points) => {
    let loyaltyDiscountPercent = 0;
    if (points > 1500) {
      loyaltyDiscountPercent = 10;
    } else if (points > 500) {
      loyaltyDiscountPercent = 5;
    }
    return Math.round((subtotal * loyaltyDiscountPercent) / 100);
  };

  // 1. Initial State: Silver (0 points)
  // Subtotal = 1000. Expected discount = 0.
  let subtotal = 1000;
  let discount = getLoyaltyDiscount(subtotal, testUser.loyaltyPoints);
  console.log(`\n--- Test Case 1: Silver Tier (0 points) ---`);
  console.log(`Subtotal: ₹${subtotal}, Expected Discount: ₹0, Calculated: ₹${discount}`);
  if (discount === 0) {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Simulate updating points to Gold tier (e.g. 600 points)
  testUser.loyaltyPoints = 600;
  testUser.membership = "Gold";
  await testUser.save();
  console.log(`\nSimulating User Upgrade -> Points: ${testUser.loyaltyPoints}, Tier: ${testUser.membership}`);

  // 2. Gold State: (600 points)
  // Subtotal = 1000. Expected discount = 50 (5% of 1000).
  discount = getLoyaltyDiscount(subtotal, testUser.loyaltyPoints);
  console.log(`--- Test Case 2: Gold Tier (600 points) ---`);
  console.log(`Subtotal: ₹${subtotal}, Expected Discount: ₹50, Calculated: ₹${discount}`);
  if (discount === 50) {
    console.log("✅ Case 2 Passed!");
  } else {
    console.error("❌ Case 2 Failed!");
  }

  // Simulate updating points to Platinum tier (e.g. 1600 points)
  testUser.loyaltyPoints = 1600;
  testUser.membership = "Platinum";
  await testUser.save();
  console.log(`\nSimulating User Upgrade -> Points: ${testUser.loyaltyPoints}, Tier: ${testUser.membership}`);

  // 3. Platinum State: (1600 points)
  // Subtotal = 1000. Expected discount = 100 (10% of 1000).
  discount = getLoyaltyDiscount(subtotal, testUser.loyaltyPoints);
  console.log(`--- Test Case 3: Platinum Tier (1600 points) ---`);
  console.log(`Subtotal: ₹${subtotal}, Expected Discount: ₹100, Calculated: ₹${discount}`);
  if (discount === 100) {
    console.log("✅ Case 3 Passed!");
  } else {
    console.error("❌ Case 3 Failed!");
  }

  // Cleanup test user
  await User.deleteOne({ _id: testUser._id });
  console.log("\nCleaned up test user.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
