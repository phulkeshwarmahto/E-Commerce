import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedCategories } from "./seeds/categories.seed.js";

const PORT = Number(process.env.PORT || 5001);

connectDB().then(async () => {
  await seedCategories();
  app.listen(PORT, () => {
    console.log(`GramBazaar server listening on http://localhost:${PORT}`);
  });
});
