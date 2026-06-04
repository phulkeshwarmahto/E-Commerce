import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/Report.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";

export const createReport = async (req, res) => {
  const { reportType, targetId, targetName, reason, description } = req.body;

  if (!reportType || !targetId || !targetName || !reason?.trim() || !description?.trim()) {
    return res.status(400).json(
      new ApiResponse(false, "reportType, targetId, targetName, reason, and description are required.")
    );
  }

  const allowedTypes = ["product", "review", "seller", "other"];
  if (!allowedTypes.includes(reportType)) {
    return res.status(400).json(new ApiResponse(false, "Invalid reportType."));
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
  });

  // Create notifications for all admins
  try {
    const admins = await User.find({ role: "admin" }, "_id");
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      title: `⚠️ New Report: ${reportType}`,
      message: `${reporterName} reported ${targetName} for: "${reason.trim()}". Description: "${description.trim()}"`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Error generating report notifications for admins:", notifErr);
  }

  return res.status(201).json(
    new ApiResponse(true, "Report submitted successfully.", {
      report: report.toClient(),
    })
  );
};
