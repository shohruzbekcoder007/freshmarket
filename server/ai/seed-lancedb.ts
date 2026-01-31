import "dotenv/config";
import { connectDB } from "../db";
import { ProductModel, CategoryModel } from "@shared/schema";
import { createProductTable } from "./lancedb";
import mongoose from "mongoose";

async function seedLanceDB() {
  console.log("Starting LanceDB seeding from MongoDB...");

  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Fetch all products
    const products = await ProductModel.find().lean();
    
    if (products.length === 0) {
      console.log("MongoDB bo'sh! Avval mahsulotlar qo'shing.");
      process.exit(0);
    }

    console.log(`MongoDB-dan ${products.length} ta mahsulot topildi.`);

    // 3. Format data for LanceDB
    const formattedProducts = [];

    for (const p of products) {
      // Fetch category name if categoryId exists
      let categoryName = "Boshqa";
      if (p.categoryId) {
        const category = await CategoryModel.findById(p.categoryId).lean();
        if (category) {
          categoryName = category.name;
        }
      }

      formattedProducts.push({
        id: p._id.toString(), // Preserve MongoDB _id
        name: p.name,
        description: p.description || "",
        price: p.price,
        category: categoryName,
        stock: p.stock,
        unit: p.unit
      });
    }

    // 4. Save to LanceDB
    console.log("LanceDB-ga yozilmoqda (Embedding generatsiya qilinmoqda)...");
    await createProductTable(formattedProducts);

    console.log("✅ LanceDB seeding muvaffaqiyatli yakunlandi!");
    process.exit(0);
  } catch (error) {
    console.error("LanceDB seedingda xatolik:", error);
    process.exit(1);
  }
}

seedLanceDB();

export { seedLanceDB };
