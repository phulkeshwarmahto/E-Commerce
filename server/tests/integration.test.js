import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";

// Set node environment to test
process.env.NODE_ENV = "test";

const originalUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GaramBazaar";
let testUri;
if (originalUri.includes("?")) {
  const [base, query] = originalUri.split("?");
  if (base.endsWith("/")) {
    testUri = `${base}GaramBazaar_test?${query}`;
  } else {
    testUri = `${base}/GaramBazaar_test?${query}`;
  }
} else {
  testUri = `${originalUri}/GaramBazaar_test`;
}
process.env.MONGODB_URI = testUri;

let server;
let baseUrl;

// Helper to parse cookies from headers
function parseCookies(cookieHeaders) {
  if (!cookieHeaders) return {};
  const cookies = {};
  cookieHeaders.forEach(header => {
    const parts = header.split(";")[0].split("=");
    cookies[parts[0].trim()] = parts[1].trim();
  });
  return cookies;
}

test.before(async () => {
  await connectDB();
  // Clear the database tables for test run
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({})
  ]);

  // Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

test("Integration Test Suite: Auth, Webhooks, and Multi-Vendor Order Isolation", async (t) => {
  let sellerACookie = "";
  let sellerBCookie = "";
  let customerCookie = "";
  
  let sellerAProduct;
  let sellerBProduct;
  let orderNumber;

  await t.test("1. Register Seller A and Seller B", async () => {
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Seller A",
        email: "sellerA@test.com",
        password: "password123",
        role: "seller"
      })
    });
    assert.strictEqual(resA.status, 201);
    const cookiesA = parseCookies(resA.headers.getSetCookie());
    assert.ok(cookiesA.token, "Should return authentication token cookie for Seller A");
    sellerACookie = `token=${cookiesA.token}`;

    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Seller B",
        email: "sellerB@test.com",
        password: "password123",
        role: "seller"
      })
    });
    assert.strictEqual(resB.status, 201);
    const cookiesB = parseCookies(resB.headers.getSetCookie());
    assert.ok(cookiesB.token, "Should return authentication token cookie for Seller B");
    sellerBCookie = `token=${cookiesB.token}`;
  });

  await t.test("2. Register Customer", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: "customer@test.com",
        password: "password123",
        role: "user"
      })
    });
    assert.strictEqual(res.status, 201);
    const cookies = parseCookies(res.headers.getSetCookie());
    assert.ok(cookies.token, "Should return authentication token cookie for customer");
    customerCookie = `token=${cookies.token}`;
  });

  await t.test("3. Create products for Sellers A and B", async () => {
    // Seller A creates product
    const sellerA = await User.findOne({ email: "sellerA@test.com" });
    sellerAProduct = await Product.create({
      name: "Seller A Item",
      slug: "seller-a-item",
      description: "Item from Seller A",
      category: "Organic Fruits",
      price: 150,
      seller: sellerA._id,
      inStock: true,
      stockCount: 10,
      isPublished: true
    });

    // Seller B creates product
    const sellerB = await User.findOne({ email: "sellerB@test.com" });
    sellerBProduct = await Product.create({
      name: "Seller B Item",
      slug: "seller-b-item",
      description: "Item from Seller B",
      category: "Organic Vegetables",
      price: 300,
      seller: sellerB._id,
      inStock: true,
      stockCount: 5,
      isPublished: true
    });

    assert.ok(sellerAProduct._id);
    assert.ok(sellerBProduct._id);
  });

  await t.test("4. Create Multi-Vendor Order (Customer placing order)", async () => {
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": customerCookie
      },
      body: JSON.stringify({
        items: [
          { productId: sellerAProduct._id.toString(), quantity: 2 },
          { productId: sellerBProduct._id.toString(), quantity: 1 }
        ],
        shippingAddress: {
          name: "Test Customer",
          phone: "9876543210",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        paymentMethod: "cod"
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.data.order.orderNumber);
    orderNumber = data.data.order.orderNumber;
  });

  await t.test("5. Tenant isolation: Seller A cannot update Seller B's item status, and vice versa", async () => {
    // Seller A updates status of their item in the order to 'On the Way'
    const res = await fetch(`${baseUrl}/seller/orders/${orderNumber}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": sellerACookie
      },
      body: JSON.stringify({
        status: "On the Way"
      })
    });

    assert.strictEqual(res.status, 200);
    
    // Check order state in DB
    const orderObj = await Order.findOne({ orderNumber }).lean();
    
    // Seller A product item should be 'On the Way'
    const itemA = orderObj.items.find(i => i.productId.toString() === sellerAProduct._id.toString());
    assert.strictEqual(itemA.fulfillmentStatus, "On the Way");

    // Seller B product item should remain 'Processing'
    const itemB = orderObj.items.find(i => i.productId.toString() === sellerBProduct._id.toString());
    assert.strictEqual(itemB.fulfillmentStatus, "Processing");

    // The global order status should still be 'Processing' since item B is still Processing
    assert.strictEqual(orderObj.status, "Processing");
  });

  await t.test("6. Webhook safety: webhook endpoint blocks requests without correct signature", async () => {
    const res = await fetch(`${baseUrl}/payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid-signature"
      },
      body: JSON.stringify({
        event: "payment.captured"
      })
    });

    // Should return 400 Bad Request or 403 Forbidden due to invalid signature
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test("7. Security hardening: query string token in URL is rejected for authentication", async () => {
    // Attempting to stream notifications with token in query string (without cookie/header)
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.somesignature";
    const res = await fetch(`${baseUrl}/notifications/stream?token=${fakeToken}`);
    assert.strictEqual(res.status, 401);
  });

  await t.test("8. Atomic Stock Isolation: placing order exceeding remaining stock fails cleanly", async () => {
    // Create a product with only 1 item in stock
    const sellerA = await User.findOne({ email: "sellerA@test.com" });
    const scarceProduct = await Product.create({
      name: "Scarce Item",
      slug: "scarce-item",
      description: "Only 1 available",
      category: "Pantry",
      price: 500,
      seller: sellerA._id,
      inStock: true,
      stockCount: 1,
      isPublished: true
    });

    // Attempt to order 2 units of scarce product
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": customerCookie
      },
      body: JSON.stringify({
        items: [
          { productId: scarceProduct._id.toString(), quantity: 2 }
        ],
        shippingAddress: {
          name: "Test Customer",
          phone: "9876543210",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        paymentMethod: "cod"
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 500); // Thrown error captured by errorHandler or 400
    assert.strictEqual(data.success, false);
    
    // Check that stock was preserved at 1 and not decremented into negative numbers
    const rechecked = await Product.findById(scarceProduct._id);
    assert.strictEqual(rechecked.stockCount, 1);
  });
});
