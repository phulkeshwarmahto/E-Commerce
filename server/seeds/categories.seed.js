import { Category } from "../models/Category.model.js";

export const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: "Pantry", emoji: "🥫", slug: "pantry" },
        { name: "Beverages", emoji: "🥤", slug: "beverages" },
        { name: "Home", emoji: "🏠", slug: "home" },
        { name: "Personal Care", emoji: "🧴", slug: "personal-care" },
        { name: "Health", emoji: "🩺", slug: "health" },
      ];
      await Category.insertMany(defaultCategories);
      console.log("Database seeded with default categories.");
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};
