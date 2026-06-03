import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/Notification.model.js";

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(
    new ApiResponse(true, "Notifications fetched.", {
      notifications: notifications.map((n) => n.toClient()),
    })
  );
};

export const markAsRead = async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    return res.status(404).json(new ApiResponse(false, "Notification not found."));
  }

  notification.isRead = true;
  await notification.save();

  res.json(
    new ApiResponse(true, "Notification marked as read.", {
      notification: notification.toClient(),
    })
  );
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.json(new ApiResponse(true, "All notifications marked as read."));
};
