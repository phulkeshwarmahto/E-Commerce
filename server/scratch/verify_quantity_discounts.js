import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/Product.model.js";

dotenv.config({ path: "server/.env" });

// Local reproduction of quantity discount logic
const applyQuantityDiscount = (product, quantity) => {
  const qDiscounts = product.quantityDiscounts || [];
  let applicableDiscountPercent = 0;
  for (const qd of qDiscounts) {
    if (quantity >= qd.quantity && qd.discountPercent > applicableDiscountPercent) {
      applicableDiscountPercent = qd.discountPercent;
    }
  }
  let price = product.price;
  if (applicableDiscountPercent > 0) {
    price = Math.round(price * (1 - applicableDiscountPercent / 100));
  }
  return { price, subtotal: price * quantity, discountPercent: applicableDiscountPercent };
};

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Mock product configuration
  const product = {
    name: "Organic Mangoes",
    price: 100,
    quantityDiscounts: [
      { quantity: 3, discountPercent: 10 }, // Buy 3+ get 10% off
      { quantity: 5, discountPercent: 20 }  // Buy 5+ get 20% off
    ]
  };

  console.log(`\nProduct: ${product.name}, Base Price: ₹${product.price}`);
  console.log("Discount Tiers:", JSON.stringify(product.quantityDiscounts));

  // Test Case 1: Quantity = 2
  // Expected: No discount, price = 100, subtotal = 200, discount = 0%
  let result = applyQuantityDiscount(product, 2);
  console.log(`\n--- Test Case 1: Qty = 2 (Below minimum tier of 3) ---`);
  console.log(`Expected Price: ₹100, Got: ₹${result.price}`);
  console.log(`Expected Subtotal: ₹200, Got: ₹${result.subtotal}`);
  console.log(`Expected Discount: 0%, Got: ${result.discountPercent}%`);
  if (result.price === 100 && result.subtotal === 200 && result.discountPercent === 0) {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Test Case 2: Quantity = 4
  // Expected: 10% discount, price = 90, subtotal = 360, discount = 10%
  result = applyQuantityDiscount(product, 4);
  console.log(`\n--- Test Case 2: Qty = 4 (Triggers 10% off tier) ---`);
  console.log(`Expected Price: ₹90, Got: ₹${result.price}`);
  console.log(`Expected Subtotal: ₹360, Got: ₹${result.subtotal}`);
  console.log(`Expected Discount: 10%, Got: ${result.discountPercent}%`);
  if (result.price === 90 && result.subtotal === 360 && result.discountPercent === 10) {
    console.log("✅ Case 2 Passed!");
  } else {
    console.error("❌ Case 2 Failed!");
  }

  // Test Case 3: Quantity = 5
  // Expected: 20% discount, price = 80, subtotal = 400, discount = 20%
  result = applyQuantityDiscount(product, 5);
  console.log(`\n--- Test Case 3: Qty = 5 (Triggers 20% off tier) ---`);
  console.log(`Expected Price: ₹80, Got: ₹${result.price}`);
  console.log(`Expected Subtotal: ₹400, Got: ₹${result.subtotal}`);
  console.log(`Expected Discount: 20%, Got: ${result.discountPercent}%`);
  if (result.price === 80 && result.subtotal === 400 && result.discountPercent === 20) {
    console.log("✅ Case 3 Passed!");
  } else {
    console.error("❌ Case 3 Failed!");
  }

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
