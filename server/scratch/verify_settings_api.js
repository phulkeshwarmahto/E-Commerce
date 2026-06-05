import mongoose from "mongoose";
import dotenv from "dotenv";
import { Settings } from "../models/Settings.model.js";

dotenv.config();

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Save the original settings if any
  const originalSettings = await Settings.findOne();

  // Test Case 1: Create or Update Settings
  console.log("\n--- TEST CASE 1: Create/Update Site Settings ---");
  await Settings.deleteMany({}); // Start fresh

  const newSettings = await Settings.create({
    shippingFee: 59,
    shippingFreeThreshold: 600,
    homepageBanners: [
      {
        imageUrl: "http://example.com/banner.png",
        linkUrl: "/shop?category=Pantry",
        title: "Summer Pantry Sale!"
      }
    ]
  });

  const settingsDoc = await Settings.findOne();
  console.log("Created Settings - shippingFee:", settingsDoc.shippingFee);
  console.log("Created Settings - shippingFreeThreshold:", settingsDoc.shippingFreeThreshold);
  console.log("Created Settings - homepageBanners length:", settingsDoc.homepageBanners.length);

  if (
    settingsDoc.shippingFee === 59 &&
    settingsDoc.shippingFreeThreshold === 600 &&
    settingsDoc.homepageBanners.length === 1 &&
    settingsDoc.homepageBanners[0].title === "Summer Pantry Sale!"
  ) {
    console.log("✅ Case 1 Passed!");
  } else {
    console.error("❌ Case 1 Failed!");
  }

  // Test Case 2: Update settings
  console.log("\n--- TEST CASE 2: Update Site Settings ---");
  settingsDoc.shippingFee = 29;
  settingsDoc.homepageBanners.push({
    imageUrl: "http://example.com/banner2.png",
    linkUrl: "/shop?category=Home",
    title: "New Home Essentials"
  });
  await settingsDoc.save();

  const settingsDoc2 = await Settings.findOne();
  console.log("Updated Settings - shippingFee:", settingsDoc2.shippingFee);
  console.log("Updated Settings - homepageBanners length:", settingsDoc2.homepageBanners.length);

  if (settingsDoc2.shippingFee === 29 && settingsDoc2.homepageBanners.length === 2) {
    console.log("✅ Case 2 Passed!");
  } else {
    console.error("❌ Case 2 Failed!");
  }

  // Restore original settings
  console.log("\nRestoring original settings...");
  await Settings.deleteMany({});
  if (originalSettings) {
    await Settings.create({
      shippingFee: originalSettings.shippingFee,
      shippingFreeThreshold: originalSettings.shippingFreeThreshold,
      homepageBanners: originalSettings.homepageBanners
    });
    console.log("Original settings restored.");
  } else {
    console.log("No original settings existed. Database left clean.");
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
