import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    orderId: this.orderId.toString(),
    sender: this.sender.toString(),
    recipient: this.recipient.toString(),
    text: this.text,
    read: this.read,
    createdAt: this.createdAt,
  };
};

export const Message = mongoose.model("Message", messageSchema);
