import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper to search products in Mongoose
const searchProductsTool = async (query) => {
  try {
    if (!query || typeof query !== "string") {
      return [];
    }

    const cleanQuery = query.trim();
    // Try text index search first
    let products = await Product.find(
      { $text: { $search: cleanQuery }, isPublished: true },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(5)
    .lean();

    // Fallback to regex search if no results found
    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: cleanQuery, $options: "i" } },
          { category: { $regex: cleanQuery, $options: "i" } },
          { description: { $regex: cleanQuery, $options: "i" } }
        ],
        isPublished: true
      })
      .limit(5)
      .lean();
    }

    return products.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      emoji: p.emoji || "📦",
      category: p.category,
      inStock: p.inStock,
      stockCount: p.stockCount,
      variants: (p.variants || []).map(v => ({ name: v.name, price: v.price }))
    }));
  } catch (err) {
    console.error("searchProductsTool error:", err);
    return [];
  }
};

// Helper to create order directly
const createDirectOrderTool = async (userId, args) => {
  try {
    const {
      productId,
      quantity,
      variantName,
      shippingName,
      shippingPhone,
      shippingLine1,
      shippingCity,
      shippingState,
      shippingPincode
    } = args;

    const product = await Product.findById(productId);
    if (!product) {
      return { error: "Product not found." };
    }

    if (!product.inStock || product.stockCount < quantity) {
      return { error: `Product "${product.name}" is out of stock or does not have enough inventory.` };
    }

    // Resolve price
    let price = product.price;
    if (variantName) {
      const variant = product.variants.find(v => v.name === variantName);
      if (!variant || variant.stockCount < quantity) {
        return { error: `Variant "${variantName}" is out of stock or unavailable.` };
      }
      price = variant.price;
    }

    const subtotal = price * quantity;
    const shippingFee = subtotal >= 500 ? 0 : 49;
    const total = subtotal + shippingFee;

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      userId,
      items: [{
        productId: product._id,
        name: product.name,
        price,
        quantity,
        emoji: product.emoji || "📦",
        image: product.images?.[0]?.url || "",
        variantName,
        fulfillmentStatus: "Processing"
      }],
      shippingAddress: {
        name: shippingName,
        phone: shippingPhone,
        line1: shippingLine1,
        city: shippingCity,
        state: shippingState,
        pincode: shippingPincode
      },
      payment: {
        method: "card", // Default to card to redirect directly to online payment options
        status: "pending"
      },
      subtotal,
      shippingFee,
      total,
      status: "Processing",
      statusHistory: [{ status: "Processing", note: "Order placed via AI Chatbot Assistant." }]
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      total: order.total
    };
  } catch (err) {
    console.error("createDirectOrderTool error:", err);
    return { error: err.message };
  }
};

export const handleChat = async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json(new ApiResponse(false, "Message is required."));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json(new ApiResponse(false, "Gemini API is not configured on the server."));
  }

  // 1. Convert client history to Gemini format
  const contents = [];
  history.forEach((msg) => {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    });
  });

  // Append user's current message
  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  // System instruction for shopping assistant
  const systemInstruction = {
    parts: [{
      text: `You are GaramAssistant, the premium and intelligent conversational AI Shopping Assistant for GaramBazaar (an Indian organic e-grocer).
      
      Your goal is to answer queries, suggest store navigation links, recommend products, and guide users to make purchases.
      
      When sharing pages or navigation, ALWAYS format them as markdown links:
      - Shop Page: [Shop Now](/shop)
      - Shopping Cart: [Cart](/cart)
      - Check Out: [Checkout](/checkout)
      - Track Orders: [Orders](/orders)
      - Customer Support: [Contact Support](/contact)
      
      PRODUCT SEARCH:
      If a user asks about any product, always search for it using the 'search_products' tool to get live details before answering. Present matching products with their names, prices, and links format: '[Product Name](/products/productId)'.
      
      PLACING A DIRECT ORDER:
      If a user indicates they want to buy a product, follow this exact conversational flow:
      1. Ask for variant choice (if the product has multiple variants returned by 'search_products') and quantity.
      2. If the user is NOT logged in, remind them politely they must be logged in to complete direct orders, and provide this link: '[Log in here](/auth)'.
      3. If they are logged in, gather their delivery info step-by-step:
         - Recipient Full Name
         - Contact Phone Number
         - Shipping Address Details (Street address line 1, City, State, and a valid 6-digit Pincode)
      4. Once you have ALL these inputs, invoke the 'create_direct_order' tool. If it succeeds, let the user know and explain they will be redirected to complete payment.
      
      Remember to be helpful, polite, and output clear response copy. Do not make up product IDs, always resolve them via search_products first.`
    }]
  };

  // Define tools for function calling
  const tools = [{
    functionDeclarations: [
      {
        name: "search_products",
        description: "Searches the GaramBazaar product catalogue for matching items.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "The name, type, category, or detail of the product to search (e.g. 'mango', 'dairy')"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "create_direct_order",
        description: "Programmatically registers an unpaid order in the database for direct checkout.",
        parameters: {
          type: "OBJECT",
          properties: {
            productId: { type: "STRING", description: "The internal database ID of the product" },
            quantity: { type: "NUMBER", description: "Quantity of the item (minimum 1)" },
            variantName: { type: "STRING", description: "Optional name of the product variant (e.g. '500g')" },
            shippingName: { type: "STRING", description: "Recipient's full name" },
            shippingPhone: { type: "STRING", description: "Recipient's contact number" },
            shippingLine1: { type: "STRING", description: "Street address and house details" },
            shippingCity: { type: "STRING", description: "City" },
            shippingState: { type: "STRING", description: "State name" },
            shippingPincode: { type: "STRING", description: "6-digit postal code" }
          },
          required: ["productId", "quantity", "shippingName", "shippingPhone", "shippingLine1", "shippingCity", "shippingState", "shippingPincode"]
        }
      }
    ]
  }];

  let lastAction = null;
  let iterations = 0;
  
  try {
    while (iterations < 5) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents, systemInstruction, tools })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        return res.status(502).json(new ApiResponse(false, "Error communicating with AI service."));
      }

      const responseData = await response.json();
      const candidate = responseData.candidates?.[0];
      const botMessage = candidate?.content;

      if (!botMessage) {
        return res.status(500).json(new ApiResponse(false, "Unable to generate response."));
      }

      // Add Model's response to contents context
      contents.push(botMessage);

      // Check if Model called a function
      const firstPart = botMessage.parts?.[0];
      if (firstPart && firstPart.functionCall) {
        const { name, args } = firstPart.functionCall;
        let toolResult;

        if (name === "search_products") {
          toolResult = await searchProductsTool(args.query);
        } else if (name === "create_direct_order") {
          if (!req.user) {
            toolResult = { error: "User is not authenticated. Please log in first." };
          } else {
            const orderResult = await createDirectOrderTool(req.user._id, args);
            toolResult = orderResult;
            if (orderResult && orderResult.success) {
              lastAction = {
                type: "checkout_direct",
                payload: {
                  orderId: orderResult.orderId,
                  orderNumber: orderResult.orderNumber,
                  total: orderResult.total
                }
              };
            }
          }
        } else {
          toolResult = { error: "Unknown tool mapping." };
        }

        // Push tool execution response
        contents.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name,
                response: { result: toolResult }
              }
            }
          ]
        });

        iterations++;
      } else {
        // Return final text answer
        const text = firstPart?.text || "Let me know how I can help you.";
        return res.json(
          new ApiResponse(true, "Chat updated.", {
            message: text,
            action: lastAction
          })
        );
      }
    }

    return res.status(500).json(new ApiResponse(false, "Conversation execution loop timeout."));
  } catch (chatError) {
    console.error("handleChat controller error:", chatError);
    return res.status(500).json(new ApiResponse(false, "Internal server error during chat."));
  }
};
