import { ApiResponse } from "../utils/ApiResponse.js";

export const createPaymentOrder = (_req, res) => {
  res.json(
    new ApiResponse(true, "Mock payment order created.", {
      razorpayOrderId: `razorpay_${Date.now()}`,
      amount: 1000,
      keyId: "mock_key",
    }),
  );
};

export const verifyPayment = (_req, res) => {
  res.json(new ApiResponse(true, "Mock payment verified.", { verified: true }));
};
