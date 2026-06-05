import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Method to serialize notification to client
notificationSchema.methods.toClient = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    title: this.title,
    message: this.message,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

import { EventEmitter } from "events";
export const notificationEvents = new EventEmitter();

notificationSchema.post("save", function (doc) {
  notificationEvents.emit("new-notification", doc);
});

export const Notification = mongoose.model("Notification", notificationSchema);
