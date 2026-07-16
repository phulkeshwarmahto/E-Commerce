import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/Product.model.js";

// Helper to make API calls to Gemini with retry on rate limits
const callGemini = async (prompt, systemInstruction = null, responseMimeType = "application/json") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured on the server.");
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: responseMimeType,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(url, fetchOptions);

    if (response.status === 429) {
      // Rate limited — wait and retry with exponential backoff
      const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000); // 1s, 2s, 4s
      console.warn(`Gemini 429 rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastError = new Error("Gemini API rate limit exceeded (429). Please wait a moment and try again.");
      continue;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API call failed:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    return text;
  }

  // All retries exhausted
  throw lastError || new Error("Gemini API rate limit exceeded after retries.");
};


// 1. Suggest Product Configuration
export const suggestProduct = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json(new ApiResponse(false, "Product name is required."));
  }

  try {
    const prompt = `Generate a suggested product listing configuration for a retail product named: '${name.trim()}'. Return a JSON object with the following fields:
    - description (string, detailed and catchy, 2-3 sentences)
    - category (string, MUST be one of: Pantry, Beverages, Home, Personal Care, Health)
    - price (number, typical market price in INR)
    - originalPrice (number, typical original price in INR, slightly higher than price, or null if no discount)
    - stockCount (number, typical stock count, e.g. 50)
    - deliveryFee (number, 0 for free delivery, or 49)
    - sku (string, unique code)
    - barcode (string, unique EAN/UPC barcode)
    - emoji (string, single representative emoji)
    Return ONLY the raw JSON object, without any formatting.`;

    const systemInstruction = "You are a helpful retail marketing copywriter.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Product suggestions generated.", json));
  } catch (err) {
    console.error("suggestProduct error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate suggestions."));
  }
};

// 2. Reply to QnA
export const replyQna = async (req, res) => {
  const { question, productId } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json(new ApiResponse(false, "Question is required."));
  }

  try {
    let productContext = "";
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productContext = `Product Name: "${product.name}", Category: "${product.category}", Description: "${product.description}"`;
      }
    }

    const prompt = `A customer has asked the following question: "${question.trim()}".
    ${productContext ? `Product Context: ${productContext}` : ""}
    Generate a professional, polite, and helpful customer service response (1-2 sentences). Return a JSON object with a single field 'reply'.`;

    const systemInstruction = "You are a customer service assistant representing GaramBazaar.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "QnA draft reply generated.", json));
  } catch (err) {
    console.error("replyQna error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate reply."));
  }
};

// 3. Reply to Customer Review
export const replyReview = async (req, res) => {
  const { rating, reviewText, productId } = req.body;
  if (rating === undefined) {
    return res.status(400).json(new ApiResponse(false, "Rating is required."));
  }

  try {
    let productContext = "";
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productContext = `Product Name: "${product.name}"`;
      }
    }

    const prompt = `A customer has left a ${rating}-star review ${productId ? `for product "${productContext}"` : ""}.
    Review Text: "${(reviewText || "").trim()}"
    Generate a professional, polite response from the shop owner. If the review is negative (1-3 stars), offer assistance and be empathetic. If positive (4-5 stars), thank them. Return a JSON object with a single field 'reply'.`;

    const systemInstruction = "You are the shop owner representing GaramBazaar customer success.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Review response generated.", json));
  } catch (err) {
    console.error("replyReview error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate response."));
  }
};

// 4. Suggest Campaign Details
export const suggestCampaign = async (req, res) => {
  const { theme } = req.body;
  if (!theme || !theme.trim()) {
    return res.status(400).json(new ApiResponse(false, "Campaign theme is required."));
  }

  try {
    const prompt = `Generate a marketing campaign based on the theme: '${theme.trim()}'. Return a JSON object with these fields:
    - bannerTitle (string, catchy banner heading)
    - bannerCopy (string, short descriptive text)
    - bannerOffer (string, e.g. 'Flat 20% Off' or 'Buy 1 Get 1')
    - notificationTitle (string, push notification title)
    - notificationBody (string, push notification message)`;

    const systemInstruction = "You are an expert digital marketing manager.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Campaign details generated.", json));
  } catch (err) {
    console.error("suggestCampaign error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate campaign."));
  }
};

// 5. Summarize Reviews
export const summarizeReviews = async (req, res) => {
  const { reviews } = req.body;
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json(new ApiResponse(false, "Reviews list is required."));
  }

  try {
    const reviewsText = reviews.map((r, i) => `${i+1}. [${r.rating} stars] ${r.comment || ""}`).join("\n");
    const prompt = `Analyze the following list of customer reviews and generate a concise summary:
    ${reviewsText}
    Return a JSON object with:
    - pros (array of strings, maximum 3 highlights)
    - cons (array of strings, maximum 3 concerns, or empty if none)
    - verdict (string, single sentence overall recommendation)`;

    const systemInstruction = "You are a product reviews analyst assistant.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Reviews summary generated.", json));
  } catch (err) {
    console.error("summarizeReviews error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate summary."));
  }
};

// 6. Draft Global Announcement Broadcast
export const draftBroadcast = async (req, res) => {
  const { theme } = req.body;
  if (!theme || !theme.trim()) {
    return res.status(400).json(new ApiResponse(false, "Announcement theme is required."));
  }

  try {
    const prompt = `Draft a global announcement broadcast message for our shoppers. Theme: '${theme.trim()}'. Return a JSON object with:
    - title (string, short headline)
    - body (string, body text, max 2 sentences)`;

    const systemInstruction = "You are a copywriting assistant.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Broadcast draft generated.", json));
  } catch (err) {
    console.error("draftBroadcast error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate broadcast."));
  }
};

// 7. Draft Individual Direct Message
export const draftUserMessage = async (req, res) => {
  const { userName, context } = req.body;
  if (!userName || !context) {
    return res.status(400).json(new ApiResponse(false, "User name and context are required."));
  }

  try {
    const prompt = `Draft a direct personal customer support message to '${userName.trim()}' regarding: '${context.trim()}'. Return a JSON object with:
    - message (string, polite and formatted body text)`;

    const systemInstruction = "You are a customer service writer.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Direct message draft generated.", json));
  } catch (err) {
    console.error("draftUserMessage error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate message."));
  }
};

// 8. Draft Promotional Newsletter
export const draftNewsletter = async (req, res) => {
  const { theme, products } = req.body;
  if (!theme || !theme.trim()) {
    return res.status(400).json(new ApiResponse(false, "Newsletter theme is required."));
  }

  try {
    const prompt = `Draft a promotional email newsletter. Theme: '${theme.trim()}'. ${products ? `Featured Products: '${products}'` : ""}. Return a JSON object with:
    - subject (string, catchy email subject line)
    - body (string, HTML body content formatted with clean email-friendly styles)`;

    const systemInstruction = "You are an email marketer copywriting assistant.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Newsletter draft generated.", json));
  } catch (err) {
    console.error("draftNewsletter error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate newsletter."));
  }
};

// 9. Draft Spotlight Ad
export const draftSpotlight = async (req, res) => {
  const { brandName, highlight } = req.body;
  if (!brandName || !highlight) {
    return res.status(400).json(new ApiResponse(false, "Brand name and highlight theme are required."));
  }

  try {
    const prompt = `Draft a brand spotlight ad for '${brandName.trim()}' focusing on: '${highlight.trim()}'. Return a JSON object with:
    - title (string, ad headline)
    - copy (string, short description)
    - offer (string, promo offer text)
    - accent (string, a suitable dark color hex code matching the brand mood)`;

    const systemInstruction = "You are a spotlight campaign designer.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Spotlight draft generated.", json));
  } catch (err) {
    console.error("draftSpotlight error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate spotlight."));
  }
};

// 10. Suggest Site Settings Configurations
export const suggestSiteSettings = async (req, res) => {
  const { season } = req.body;
  if (!season || !season.trim()) {
    return res.status(400).json(new ApiResponse(false, "Site season/campaign theme is required."));
  }

  try {
    const prompt = `Generate site branding announcements for the season/campaign: '${season.trim()}'. Return a JSON object with:
    - announcementBarText (string, e.g. '✨ Free shipping on all orders over ₹499 this monsoon!')
    - heroHeadline (string, primary site banner heading)
    - heroSubheadline (string, site banner description)`;

    const systemInstruction = "You are a visual design and marketing assistant.";
    const resultText = await callGemini(prompt, systemInstruction, "application/json");
    const json = JSON.parse(resultText);

    return res.json(new ApiResponse(true, "Site settings suggestions generated.", json));
  } catch (err) {
    console.error("suggestSiteSettings error:", err.message);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to generate site settings."));
  }
};
