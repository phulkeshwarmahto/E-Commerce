import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const now = () => new Date().toISOString();

const productsFile = path.join(__dirname, "../seeds/products.json");

let products = [];
try {
  const data = fs.readFileSync(productsFile, "utf8");
  products = JSON.parse(data);
} catch (error) {
  console.log("Products file not found or invalid, using default products.");
  products = [
    // ... existing products ...
  ];
}

const saveProducts = () => {
  try {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Failed to save products:", error);
  }
};

export const db = {
  users: [
    {
      id: "user-1",
      name: "Phulkeshwar Mahto",
      email: "phulkeshwar@example.com",
      password: "password123",
      role: "user",
      membership: "Gold",
      createdAt: now(),
    },
    {
      id: "admin-1",
      name: "GramBazaar Admin",
      email: "admin@grambazaar.in",
      password: "Admin@123",
      role: "admin",
      membership: "Platinum",
      createdAt: now(),
    },
  ],
  products,
  // ... rest of db ...
  // ... rest of db ...
  reviews: [
    {
      id: "review-1",
      productId: "prod-1",
      userId: "user-1",
      name: "Ananya S.",
      rating: 5,
      title: "Best raw honey",
      body: "Balanced sweetness and a rich floral aroma. This has become our everyday breakfast staple.",
      media: [],
      isApproved: true,
      createdAt: now(),
    },
    {
      id: "review-2",
      productId: "prod-2",
      userId: "user-1",
      name: "Rajesh K.",
      rating: 4,
      title: "Fresh and light",
      body: "Lovely cup with a clean finish. Packaging could be better, but the tea itself is excellent.",
      media: [],
      isApproved: true,
      createdAt: now(),
    },
  ],
  carts: {
    "user-1": [
      {
        productId: "prod-1",
        quantity: 1,
      },
    ],
  },
  orders: [
    {
      id: "ORD-8472",
      userId: "user-1",
      createdAt: "2026-04-15T10:00:00.000Z",
      items: [
        { productId: "prod-1", name: "Organic Wild Honey", price: 399, quantity: 1, emoji: "🍯" },
        { productId: "prod-3", name: "Olive Oil Extra Virgin", price: 549, quantity: 1, emoji: "🫒" },
      ],
      shippingAddress: {
        name: "Phulkeshwar Mahto",
        phone: "9999999999",
        line1: "72 Market Road",
        city: "Ranchi",
        state: "Jharkhand",
        pincode: "834001",
      },
      payment: {
        method: "cod",
        status: "paid",
      },
      subtotal: 948,
      shippingFee: 0,
      discount: 0,
      couponCode: "",
      total: 948,
      status: "Delivered",
      statusHistory: [
        { status: "Processing", updatedAt: "2026-04-15T10:00:00.000Z", note: "Order confirmed" },
        { status: "Delivered", updatedAt: "2026-04-18T14:00:00.000Z", note: "Delivered" },
      ],
    },
  ],
  coupons: [
    { code: "GRAM10", discountType: "percent", discountValue: 10, minOrderAmount: 500 },
    { code: "SAVE20", discountType: "percent", discountValue: 20, minOrderAmount: 1200 },
    { code: "FIRST50", discountType: "flat", discountValue: 50, minOrderAmount: 299 },
  ],
};

export const findUserById = (id) => db.users.find((user) => user.id === id);
export const findProductById = (id) => db.products.find((product) => product.id === id);
export { saveProducts };
