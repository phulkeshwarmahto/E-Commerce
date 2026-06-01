import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";
import { ProductFAQ } from "../models/ProductFAQ.model.js";

export const getProductFAQs = async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json(new ApiResponse(false, "productId is required."));
  }

  const faqs = await ProductFAQ.find({ productId }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(true, "FAQs fetched.", { faqs: faqs.map((faq) => faq.toClient()) }));
};

export const createQuestion = async (req, res) => {
  const { productId, question } = req.body;

  if (!productId || !question?.trim()) {
    return res.status(400).json(new ApiResponse(false, "productId and question are required."));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  const faq = await ProductFAQ.create({
    productId,
    buyerId: req.user._id,
    buyerName: req.user.name || req.user.email,
    question: question.trim(),
  });

  return res.status(201).json(new ApiResponse(true, "Question submitted.", { faq: faq.toClient() }));
};

export const answerQuestion = async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body;

  if (!answer?.trim()) {
    return res.status(400).json(new ApiResponse(false, "answer is required."));
  }

  const faq = await ProductFAQ.findById(id);
  if (!faq) {
    return res.status(404).json(new ApiResponse(false, "Question not found."));
  }

  const product = await Product.findById(faq.productId);
  if (!product) {
    return res.status(404).json(new ApiResponse(false, "Product not found."));
  }

  // Authorize: Only the product's seller or an admin can answer
  if (product.seller?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json(new ApiResponse(false, "Not authorized to answer this question."));
  }

  faq.answer = answer.trim();
  faq.answeredBy = req.user._id;
  faq.answeredByName = req.user.name || req.user.email;
  faq.isAnswered = true;

  await faq.save();

  return res.json(new ApiResponse(true, "Answer submitted.", { faq: faq.toClient() }));
};
