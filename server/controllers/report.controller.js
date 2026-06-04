import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { Product } from "../models/Product.model.js";
import { Review } from "../models/Review.model.js";

export const createReport = async (req, res) => {
  const { reportType, targetId, targetName, reason, description, recipient = "admin" } = req.body;

  if (!reportType || !targetId || !targetName || !reason?.trim() || !description?.trim()) {
    return res.status(400).json(
      new ApiResponse(false, "reportType, targetId, targetName, reason, and description are required.")
    );
  }

  const allowedTypes = ["product", "review", "seller", "other"];
  if (!allowedTypes.includes(reportType)) {
    return res.status(400).json(new ApiResponse(false, "Invalid reportType."));
  }

  const allowedRecipients = ["admin", "seller", "both"];
  if (!allowedRecipients.includes(recipient)) {
    return res.status(400).json(new ApiResponse(false, "Invalid recipient."));
  }

  const reporterName = req.user.name || req.user.email;

  const report = await Report.create({
    reporterId: req.user._id,
    reporterName,
    reportType,
    targetId,
    targetName,
    reason: reason.trim(),
    description: description.trim(),
    recipient,
  });

  // Look up associated seller if reporting to seller or both
  let sellerId = null;
  if (recipient === "seller" || recipient === "both") {
    try {
      if (reportType === "product") {
        const product = await Product.findById(targetId);
        if (product && product.seller) {
          sellerId = product.seller.toString();
        }
      } else if (reportType === "seller") {
        sellerId = targetId;
      } else if (reportType === "review") {
        const review = await Review.findById(targetId);
        if (review && review.productId) {
          const product = await Product.findById(review.productId);
          if (product && product.seller) {
            sellerId = product.seller.toString();
          }
        }
      }
    } catch (err) {
      console.error("Error looking up seller for report:", err);
    }
  }

  // Create notifications based on recipient selection
  try {
    const notifications = [];
    const notifTitle = `⚠️ New Report: ${reportType}`;
    const notifMessage = `${reporterName} reported ${targetName} for: "${reason.trim()}". Description: "${description.trim()}"`;

    if (recipient === "admin" || recipient === "both") {
      const admins = await User.find({ role: "admin" }, "_id");
      admins.forEach((admin) => {
        notifications.push({
          userId: admin._id,
          title: notifTitle,
          message: notifMessage,
        });
      });
    }

    if ((recipient === "seller" || recipient === "both") && sellerId) {
      notifications.push({
        userId: sellerId,
        title: notifTitle,
        message: notifMessage,
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Error generating report notifications:", notifErr);
  }

  return res.status(201).json(
    new ApiResponse(true, "Report submitted successfully.", {
      report: report.toClient(),
    })
  );
};
