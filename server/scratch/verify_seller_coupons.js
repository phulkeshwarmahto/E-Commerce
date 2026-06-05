import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";
import { User } from "../models/User.model.js";
import { Coupon } from "../models/Coupon.model.js";

dotenv.config();

// Local reproduction of calculateDiscount from order.controller.js
const calculateDiscount = async (couponCode, orderItems) => {
  if (!couponCode) {
    return { discount: 0, couponCode: "" };
  }

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
  const expired = coupon?.expiresAt && coupon.expiresAt.getTime() < Date.now();

  if (!coupon || expired) {
    return { discount: 0, couponCode: "" };
  }

  // Calculate subtotal of items that are eligible for this coupon
  let eligibleSubtotal = 0;
  if (coupon.sellerId) {
    // Seller-specific coupon: only sum subtotal of products from this seller
    orderItems.forEach((item) => {
      if (item.product.seller?.toString() === coupon.sellerId.toString()) {
        eligibleSubtotal += item.subtotal;
      }
    });
  } else {
    // Platform-wide coupon: all products are eligible
    eligibleSubtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Check minOrderAmount against eligible subtotal
  if (eligibleSubtotal < coupon.minOrderAmount || eligibleSubtotal === 0) {
    return { discount: 0, couponCode: "" };
  }

  const discount =
    coupon.discountType === "percent"
      ? Math.round((eligibleSubtotal * coupon.discountValue) / 100)
      : coupon.discountValue;

  return {
    discount: Math.min(discount, eligibleSubtotal),
    couponCode: coupon.code,
  };
};

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Find a seller user
  let seller = await User.findOne({ role: "seller" });
  if (!seller) {
    seller = await User.create({
      name: "Test Seller",
      email: "testseller@grambazaar.com",
      role: "seller",
      isVerified: true
    });
  }
  console.log(`Using Seller: ${seller.name} (${seller._id})`);

  // Find another user (e.g. admin or other seller)
  let otherSeller = await User.findOne({ email: "admin@grambazaar.com" });
  if (!otherSeller) {
    otherSeller = await User.findOne({ role: "admin" });
  }
  if (!otherSeller) {
    otherSeller = await User.create({
      name: "Other Merchant",
      email: "other@grambazaar.com",
      role: "seller",
      isVerified: true
    });
  }
  console.log(`Using Other Merchant: ${otherSeller.name} (${otherSeller._id})`);

  // Setup products
  const productA = {
    name: "Seller Apple",
    price: 50,
    seller: seller._id,
  };
  const productB = {
    name: "Other Banana",
    price: 30,
    seller: otherSeller._id,
  };

  // Setup Seller Coupon: Code "SELLER10", 10% off, min order 100 for seller's products
  await Coupon.deleteOne({ code: "SELLER10" });
  const coupon = await Coupon.create({
    code: "SELLER10",
    discountType: "percent",
    discountValue: 10,
    minOrderAmount: 100,
    sellerId: seller._id,
    active: true
  });
  console.log("Created coupon SELLER10.");

  // Test Case 1: Seller products subtotal < 100 (e.g. 1 Apple = 50), Other products = 150. Total = 200.
  // Discount should be 0 since seller subtotal (50) is less than coupon's minOrderAmount (100).
  const orderItems1 = [
    { product: productA, quantity: 1, subtotal: 50 },
    { product: productB, quantity: 5, subtotal: 150 }
  ];
  const res1 = await calculateDiscount("SELLER10", orderItems1);
  console.log("\n--- TEST CASE 1 ---");
  console.log("Expected discount: 0");
  console.log("Calculated discount:", res1.discount);
  if (res1.discount === 0) {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Test Case 2: Seller products subtotal >= 100 (e.g. 3 Apples = 150), Other products = 50. Total = 200.
  // Discount should be 10% of 150 = 15 (only calculated on seller's products).
  const orderItems2 = [
    { product: productA, quantity: 3, subtotal: 150 },
    { product: productB, quantity: 1, subtotal: 50 }
  ];
  const res2 = await calculateDiscount("SELLER10", orderItems2);
  console.log("\n--- TEST CASE 2 ---");
  console.log("Expected discount: 15");
  console.log("Calculated discount:", res2.discount);
  if (res2.discount === 15) {
    console.log("✅ Case 2 Passed!");
  } else {
    console.error("❌ Case 2 Failed!");
  }

  // Cleanup
  await Coupon.deleteOne({ _id: coupon._id });
  console.log("\nCleaned up test coupon.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
