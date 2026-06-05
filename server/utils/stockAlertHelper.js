import { StockAlert } from "../models/StockAlert.model.js";
import { Product } from "../models/Product.model.js";
import { Notification } from "../models/Notification.model.js";
import { sendEmail } from "./sendEmail.js";

export const processStockAlerts = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product || !product.inStock) return;

    // Find all pending alerts for this product
    const alerts = await StockAlert.find({ productId, notified: false }).populate("userId");
    if (alerts.length === 0) return;

    const notifiedAlertIds = [];

    for (const alert of alerts) {
      if (!alert.userId) continue;

      let isAvailable = false;
      let displayName = product.name;

      if (alert.variantName) {
        const variant = product.variants.find((v) => v.name === alert.variantName);
        if (variant && variant.stockCount > 0) {
          isAvailable = true;
          displayName = `${product.name} (${alert.variantName})`;
        }
      } else {
        if (product.stockCount > 0 || (product.variants && product.variants.some(v => v.stockCount > 0))) {
          isAvailable = true;
        }
      }

      if (isAvailable) {
        // Create in-app notification
        await Notification.create({
          userId: alert.userId._id,
          title: "🌿 Item Back in Stock!",
          message: `Good news! "${displayName}" is back in stock. Order now before it sells out!`,
        });

        // Send Email
        try {
          await sendEmail({
            to: alert.userId.email,
            subject: `GramBazaar: "${displayName}" is Back in Stock!`,
            text: `Hello ${alert.userId.name || "Customer"},\n\nGood news! "${displayName}" is back in stock on GramBazaar.\n\nVisit our store to purchase it now: ${process.env.CLIENT_URL || "http://localhost:5173"}/product/${product.slug || product._id}\n\nHappy shopping!\nGramBazaar Team`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">🌿 Back in Stock!</h2>
                <p style="font-size: 16px; color: #333;">Hello ${alert.userId.name || "Customer"},</p>
                <p style="font-size: 16px; color: #333;">Good news! <strong>"${displayName}"</strong> is back in stock and ready for delivery.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/product/${product.slug || product._id}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Product & Order Now</a>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                  You received this email because you requested a notification alert for this product.
                </p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(`Failed to send stock alert email to ${alert.userId.email}:`, emailErr);
        }

        notifiedAlertIds.push(alert._id);
      }
    }

    if (notifiedAlertIds.length > 0) {
      await StockAlert.deleteMany({ _id: { $in: notifiedAlertIds } });
    }
  } catch (err) {
    console.error("Error processing stock alerts:", err);
  }
};
