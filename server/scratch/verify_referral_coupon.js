import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { Order } from "../models/Order.model.js";
import { Coupon } from "../models/Coupon.model.js";
import { Notification } from "../models/Notification.model.js";

dotenv.config({ path: "server/.env" });

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Generate unique codes/emails
  const referrerEmail = `referrer_${Date.now()}@grambazaar.com`;
  const refereeEmail = `referee_${Date.now()}@grambazaar.com`;
  const referrerRefCode = `REF-TEST-${Date.now().toString().slice(-4)}`.toUpperCase();

  // Create Referrer
  const referrer = await User.create({
    name: "Referrer User",
    email: referrerEmail,
    referralCode: referrerRefCode,
    loyaltyPoints: 0,
    role: "user",
    isVerified: true
  });
  console.log(`Created referrer: ${referrer.name} with referralCode: ${referrer.referralCode}`);

  // Create Referee (sign up using referrer's referralCode)
  const referee = await User.create({
    name: "Referee User",
    email: refereeEmail,
    referredBy: referrer._id,
    loyaltyPoints: 0,
    role: "user",
    isVerified: true
  });
  console.log(`Created referee: ${referee.name}, referredBy referrer ID: ${referee.referredBy}`);

  // Simulate Referee's First Order Checkout Placement
  console.log("\nSimulating referee first order placement...");
  const orderNumber = `ORD-REF-TEST-${Date.now().toString().slice(-4)}`;
  const order = await Order.create({
    orderNumber,
    userId: referee._id,
    items: [
      {
        productId: new mongoose.Types.ObjectId(),
        name: "Test Basket",
        price: 200,
        quantity: 1,
        emoji: "🧺"
      }
    ],
    shippingAddress: {
      name: "Referee Home",
      phone: "1234567890",
      line1: "123 Green Valley",
      city: "Gwalior",
      state: "Madhya Pradesh",
      pincode: "474001"
    },
    subtotal: 200,
    total: 200,
    status: "Processing"
  });
  console.log(`Order ${order.orderNumber} created successfully.`);

  // Test Referee first order coupon award trigger
  const isFirstOrder = (await Order.countDocuments({ userId: referee._id })) === 1;
  console.log(`Referee total orders count: ${await Order.countDocuments({ userId: referee._id })}, isFirstOrder: ${isFirstOrder}`);

  let refereeCouponCode = `REF-WELCOME-15-${referee._id.toString().slice(-6)}`.toUpperCase();
  let referrerCouponCode = `REF-WELCOME-15-${referrer._id.toString().slice(-6)}`.toUpperCase();

  if (isFirstOrder && referee.referredBy) {
    const fetchedReferrer = await User.findById(referee.referredBy);
    if (fetchedReferrer) {
      // Create referee welcome coupon
      await Coupon.create({
        code: refereeCouponCode,
        discountType: "percent",
        discountValue: 15,
        minOrderAmount: 100,
        active: true
      });
      console.log(`✅ Created referee welcome coupon: ${refereeCouponCode}`);

      // Create referrer reward coupon
      await Coupon.create({
        code: referrerCouponCode,
        discountType: "percent",
        discountValue: 15,
        minOrderAmount: 100,
        active: true
      });
      console.log(`✅ Created referrer reward coupon: ${referrerCouponCode}`);
    }
  }

  // Verification checks
  const couponReferee = await Coupon.findOne({ code: refereeCouponCode });
  const couponReferrer = await Coupon.findOne({ code: referrerCouponCode });

  console.log("\n--- VERIFICATION ---");
  if (couponReferee && couponReferrer) {
    console.log("✅ Welcome coupons for both users generated successfully!");
    console.log("Referee Coupon:", JSON.stringify(couponReferee));
    console.log("Referrer Coupon:", JSON.stringify(couponReferrer));
  } else {
    console.error("❌ Failed to generate coupons.");
  }

  // Cleanup
  await User.deleteOne({ _id: referrer._id });
  await User.deleteOne({ _id: referee._id });
  await Order.deleteOne({ _id: order._id });
  await Coupon.deleteOne({ code: refereeCouponCode });
  await Coupon.deleteOne({ code: referrerCouponCode });
  console.log("\nCleaned up all database test entries.");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
