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
    id: this._id,
    userId: this.userId,
    title: this.title,
    message: this.message,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

export const Notification = mongoose.model("Notification", notificationSchema);
