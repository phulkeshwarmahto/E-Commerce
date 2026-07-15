import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";

export const trackClick = async (req, res) => {
  const { productId, email, phone } = req.body;

  if (!productId) {
    return res.status(400).json(new ApiResponse(false, "Product ID is required."));
  }

  try {
    // 1. Fetch the product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json(new ApiResponse(false, "Product not found."));
    }

    let targetUser = req.user;

    // 2. If user is not logged in, find or create guest user by email
    if (!targetUser) {
      if (!email) {
        return res.status(400).json(new ApiResponse(false, "Email is required for guest tracking."));
      }

      const cleanEmail = email.trim().toLowerCase();
      // Simple email validation regex
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json(new ApiResponse(false, "Invalid email address format."));
      }

      let existingUser = await User.findOne({ email: cleanEmail });

      if (existingUser) {
        // If guest has a new phone number, update it
        if (phone && !existingUser.phone) {
          existingUser.phone = phone.trim();
          await existingUser.save();
        }
        targetUser = existingUser;
      } else {
        // Create new guest/shadow user
        const namePart = cleanEmail.split("@")[0];
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
          const part1 = namePart.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();
          const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
          referralCode = `GST-${part1}-${part2}`;
          const check = await User.findOne({ referralCode });
          if (!check) isUnique = true;
        }

        targetUser = await User.create({
          name: `Guest (${namePart})`,
          email: cleanEmail,
          phone: phone ? phone.trim() : "",
          isGuest: true,
          role: "user",
          referralCode,
        });
      }
    }

    // 3. Generate unique order number
    let orderNumber;
    let isOrderUnique = false;
    while (!isOrderUnique) {
      const randVal = Math.floor(100000 + Math.random() * 900000);
      orderNumber = `AFF-${randVal}`;
      const check = await Order.findOne({ orderNumber });
      if (!check) isOrderUnique = true;
    }

    // 4. Create the click order tracking record
    const orderItem = {
      productId: product._id,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      emoji: product.emoji || "📦",
      image: product.imageUrl || "",
      variantName: product.source === "chrome-extension" ? "Chrome Extension Install" : "Web App Tryout",
      fulfillmentStatus: "Delivered",
    };

    const newOrder = await Order.create({
      orderNumber,
      userId: targetUser._id,
      items: [orderItem],
      shippingAddress: {
        name: targetUser.name,
        phone: phone || targetUser.phone || "N/A",
        line1: "Digital Delivery / Affiliate Redirect",
        city: "Digital",
        state: "Digital",
        pincode: "000000",
      },
      payment: {
        method: "cod",
        status: "paid",
      },
      subtotal: product.price || 0,
      total: product.price || 0,
      status: "Delivered",
      statusHistory: [
        { status: "Processing", updatedAt: new Date(), note: "Affiliate click tracked." },
        { status: "Delivered", updatedAt: new Date(), note: "Redirected to target URL." },
      ],
    });

    res.status(201).json(
      new ApiResponse(true, "Click tracked successfully.", {
        order: newOrder.toClient(),
        redirectUrl: product.affiliateLink,
      }),
    );
  } catch (error) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};
