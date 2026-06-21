import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";

dotenv.config();

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Find or create test user
  let user = await User.findOne({ email: "address_tester@GaramBazaar.com" });
  if (user) {
    await User.deleteOne({ _id: user._id });
  }

  user = await User.create({
    name: "Address Tester",
    email: "address_tester@GaramBazaar.com",
    role: "user",
    isVerified: true
  });
  console.log(`Created test user: ${user.name}`);

  // Test Case 1: Add address
  console.log("\n--- TEST CASE 1: Add Saved Address ---");
  const testAddress = {
    label: "Office",
    name: "John Doe",
    phone: "9876543210",
    line1: "123 Tech Park, Sector 62",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301"
  };

  user.savedAddresses.push(testAddress);
  await user.save();

  let updatedUser = await User.findById(user._id);
  console.log("Saved Addresses Count:", updatedUser.savedAddresses.length);
  if (updatedUser.savedAddresses.length === 1 && updatedUser.savedAddresses[0].label === "Office") {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Test Case 2: Update address
  console.log("\n--- TEST CASE 2: Update Saved Address ---");
  const addressId = updatedUser.savedAddresses[0]._id;
  const addressToUpdate = updatedUser.savedAddresses.id(addressId);
  addressToUpdate.label = "Headquarters";
  addressToUpdate.line1 = "456 Corporate Towers";
  await updatedUser.save();

  let updatedUser2 = await User.findById(user._id);
  const updatedAddress = updatedUser2.savedAddresses.id(addressId);
  console.log("Updated Label:", updatedAddress.label);
  console.log("Updated Line1:", updatedAddress.line1);
  if (updatedAddress.label === "Headquarters" && updatedAddress.line1 === "456 Corporate Towers") {
    console.log("✅ Case 2 Passed!");
  } else {
    console.error("❌ Case 2 Failed!");
  }

  // Test Case 3: Delete address
  console.log("\n--- TEST CASE 3: Delete Saved Address ---");
  updatedUser2.savedAddresses.pull(addressId);
  await updatedUser2.save();

  let finalUser = await User.findById(user._id);
  console.log("Final Saved Addresses Count:", finalUser.savedAddresses.length);
  if (finalUser.savedAddresses.length === 0) {
    console.log("✅ Case 3 Passed!");
  } else {
    console.error("❌ Case 3 Failed!");
  }

  // Cleanup
  await User.deleteOne({ _id: user._id });
  console.log("\nCleaned up test user.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
