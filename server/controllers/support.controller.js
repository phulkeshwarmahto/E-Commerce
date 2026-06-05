import { SupportTicket } from "../models/SupportTicket.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createSupportTicket = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    throw new Error("All fields (name, email, subject, message) are required.");
  }

  const userId = req.user ? req.user._id : null;
  const ticket = await SupportTicket.create({
    userId,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: "open"
  });

  res.status(201).json(new ApiResponse(true, "Support inquiry submitted successfully. We will get back to you shortly!", ticket.toClient()));
};

export const getSupportTickets = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const [tickets, totalItems] = await Promise.all([
    SupportTicket.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    SupportTicket.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Support tickets fetched.", {
      tickets: tickets.map(t => t.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      }
    })
  );
};

export const resolveSupportTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    throw new Error("Support ticket not found.");
  }

  ticket.status = "resolved";
  await ticket.save();

  res.json(new ApiResponse(true, "Support ticket marked as resolved.", ticket.toClient()));
};
