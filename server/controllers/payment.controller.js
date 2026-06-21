import crypto from "crypto";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getRazorpay } from "../config/razorpay.js";
import { Order } from "../models/Order.model.js";

const findOrderByIdOrNumber = async (id, userId) => {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id, userId }
    : { orderNumber: id, userId };
  return Order.findOne(query);
};

export const createPaymentOrder = async (req, res) => {
  const order = await findOrderByIdOrNumber(req.body.orderId, req.user._id);

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  if (order.payment.method === "cod") {
    return res.status(400).json(new ApiResponse(false, "COD orders do not need online payment."));
  }

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderNumber: order.orderNumber,
      userId: req.user._id.toString(),
    },
  });

  order.payment.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json(
    new ApiResponse(true, "Payment order created.", {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    }),
  );
};

export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const order = await findOrderByIdOrNumber(orderId, req.user._id);

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (!signature || expectedSignature !== signature) {
    order.payment.status = "failed";
    await order.save();
    return res.status(400).json(new ApiResponse(false, "Payment verification failed."));
  }

  order.payment.status = "paid";
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.status = "Processing";
  order.statusHistory.push({ status: "Processing", note: "Payment verified" });
  await order.save();

  res.json(new ApiResponse(true, "Payment verified.", { verified: true, order: order.toClient() }));
};

export const verifyUpiPayment = async (req, res) => {
  const { orderId } = req.body;
  const order = await findOrderByIdOrNumber(orderId, req.user._id);

  if (!order) {
    return res.status(404).json(new ApiResponse(false, "Order not found."));
  }

  order.payment.status = "paid";
  order.payment.razorpayPaymentId = `upi_${crypto.randomBytes(6).toString("hex")}`;
  order.status = "Processing";
  order.statusHistory.push({ status: "Processing", note: "Simulated UPI Payment Completed" });
  await order.save();

  res.json(new ApiResponse(true, "UPI Payment verified successfully.", { verified: true, order: order.toClient() }));
};

export const razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "myGaramBazaarWebhook@2026!secure";

  // Verify signature
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (!signature || signature !== digest) {
    return res.status(400).json(new ApiResponse(false, "Invalid webhook signature."));
  }

  const { event, payload } = req.body;

  if (event === "payment.captured" || event === "order.paid") {
    const paymentEntity = payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // Find order by razorpayOrderId
    const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });

    if (order && order.payment.status !== "paid") {
      order.payment.status = "paid";
      order.payment.razorpayPaymentId = razorpayPaymentId;
      order.status = "Processing";
      order.statusHistory.push({
        status: "Processing",
        note: `Payment verified via Razorpay webhook: ${event}`
      });
      await order.save();
    }
  }

  res.json(new ApiResponse(true, "Webhook processed."));
};

