import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reporterName: { type: String, required: true },
    reportType: {
      type: String,
      enum: ["product", "review", "seller", "other"],
      required: true,
    },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    recipient: {
      type: String,
      enum: ["admin", "seller", "both"],
      default: "admin",
      required: true,
    },
  },
  { timestamps: true },
);

reportSchema.methods.toClient = function toClient() {
  return {
    id: this._id.toString(),
    reporterId: this.reporterId.toString(),
    reporterName: this.reporterName,
    reportType: this.reportType,
    targetId: this.targetId,
    targetName: this.targetName,
    reason: this.reason,
    description: this.description,
    recipient: this.recipient,
    createdAt: this.createdAt,
  };
};

export const Report = mongoose.model("Report", reportSchema);
