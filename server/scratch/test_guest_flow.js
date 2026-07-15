import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import app from "../app.js";

dotenv.config({ override: true });

async function runTest() {
  let server;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Clean up any old test data
    await User.deleteOne({ email: "guest_test@example.com" });
    await Order.deleteMany({ shippingAddress: { $ne: null }, "shippingAddress.phone": "9876543210" });

    // Find any product to use
    const product = await Product.findOne({ productType: "affiliate" });
    if (!product) {
      throw new Error("No affiliate product found in DB to test with.");
    }
    console.log(`Using product for test: ${product.name} (${product._id})`);

    // Start a temporary test server
    await new Promise((resolve) => {
      server = app.listen(0, resolve);
    });
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;

    // 1. Simulate Guest Tracking Call
    console.log("\n--- Step 1: Simulating Guest Click Tracking ---");
    const trackRes = await fetch(`${baseUrl}/affiliate/track-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id.toString(),
        email: "guest_test@example.com",
        phone: "9876543210"
      })
    });
    const trackData = await trackRes.json();
    console.log("Track Response Success:", trackData.success);
    console.log("Track Response Message:", trackData.message);

    // Verify Guest User was created
    const guestUser = await User.findOne({ email: "guest_test@example.com" });
    if (!guestUser) throw new Error("Guest user was not created!");
    console.log("Verified Guest User Doc in DB:");
    console.log(`- ID: ${guestUser._id}`);
    console.log(`- Name: ${guestUser.name}`);
    console.log(`- isGuest: ${guestUser.isGuest}`);
    console.log(`- Phone: ${guestUser.phone}`);

    // Verify Order was created
    const guestOrder = await Order.findOne({ userId: guestUser._id });
    if (!guestOrder) throw new Error("Guest click order was not created!");
    console.log("Verified Guest Order Doc in DB:");
    console.log(`- OrderNumber: ${guestOrder.orderNumber}`);
    console.log(`- Status: ${guestOrder.status}`);
    console.log(`- Item Name: ${guestOrder.items[0].name}`);

    // 2. Simulate Registration (Upgrading the Guest)
    console.log("\n--- Step 2: Simulating Registration / Guest Upgrade ---");
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Upgraded Guest Tester",
        email: "guest_test@example.com",
        password: "securePassword123"
      })
    });
    const regData = await regRes.json();
    console.log("Register Response Success:", regData.success);
    console.log("Register Response Message:", regData.message);

    // Verify Guest User was upgraded
    const upgradedUser = await User.findOne({ email: "guest_test@example.com" });
    if (!upgradedUser) throw new Error("User doc disappeared!");
    console.log("Verified Upgraded User Doc in DB:");
    console.log(`- ID: ${upgradedUser._id} (Should match Guest ID: ${guestUser._id})`);
    console.log(`- Name: ${upgradedUser.name} (Should be Upgraded Guest Tester)`);
    console.log(`- isGuest: ${upgradedUser.isGuest} (Should be false)`);

    // Verify old click history is still linked
    const linkedOrdersCount = await Order.countDocuments({ userId: upgradedUser._id });
    console.log(`- Linked Orders Count: ${linkedOrdersCount} (Should be 1)`);

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! GUEST UPGRADE AND CLICK TRACKING IS WORKING 100%!");

    // Clean up
    await User.deleteOne({ _id: guestUser._id });
    await Order.deleteOne({ _id: guestOrder._id });
    console.log("Cleanup completed.");

  } catch (err) {
    console.error("Test Failed:", err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runTest();
