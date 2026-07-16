import { ApiResponse } from "../utils/ApiResponse.js";
import { Newsletter } from "../models/Newsletter.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json(new ApiResponse(false, "Email is required."));
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  let subscriber = await Newsletter.findOne({ email: normalizedEmail });
  if (subscriber) {
    if (subscriber.active) {
      return res.status(409).json(new ApiResponse(false, "You are already subscribed to our newsletter!"));
    } else {
      subscriber.active = true;
      await subscriber.save();
      return res.json(new ApiResponse(true, "Thank you for re-subscribing to our newsletter!"));
    }
  }

  subscriber = await Newsletter.create({ email: normalizedEmail });
  return res.status(201).json(new ApiResponse(true, "Thank you for subscribing to our newsletter!"));
};

export const getSubscribers = async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  return res.json(
    new ApiResponse(true, "Subscribers list fetched.", { subscribers })
  );
};

export const sendNewsletter = async (req, res) => {
  const { subject, html } = req.body;
  if (!subject || !html) {
    return res.status(400).json(new ApiResponse(false, "Subject and html body are required."));
  }

  try {
    const subscribers = await Newsletter.find({ active: true });
    if (subscribers.length === 0) {
      return res.json(new ApiResponse(true, "No active subscribers found."));
    }

    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({
          to: sub.email,
          subject,
          html,
          text: html.replace(/<[^>]*>/g, ""),
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send newsletter to ${sub.email}:`, err.message);
      }
    }

    return res.json(
      new ApiResponse(true, `Newsletter sent successfully to ${successCount} of ${subscribers.length} active subscribers.`)
    );
  } catch (err) {
    console.error("sendNewsletter error:", err);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to send newsletter."));
  }
};
