import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../db";
import { CategoryModel, ProductModel } from "@shared/schema";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  image?: string;
  isActive: boolean;
}

interface SeedData {
  products: ProductData[];
}

async function importData() {
  console.log("🚀 Yangi mahsulotlarni import qilish boshlandi...\n");

  try {
    // 1. MongoDB ga ulanish
    await connectDB();
    console.log("✅ MongoDB ga ulandi\n");

    // 2. JSON faylni o'qish
    const jsonPath = path.join(__dirname, "seed-data.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const data: SeedData = JSON.parse(rawData);

    console.log(`📦 JSON fayldan ${data.products.length} ta mahsulot o'qildi\n`);

    // 3. Mavjud kategoriyalarni olish
    console.log("📁 Mavjud kategoriyalar yuklanmoqda...");
    const categories = await CategoryModel.find();
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const cat of categories) {
      categoryMap.set(cat.name, cat._id);
      console.log(`   ✅ ${cat.name}`);
    }

    if (categories.length === 0) {
      console.log("   ⚠️  Kategoriyalar topilmadi! Avval kategoriyalar qo'shing.");
      process.exit(1);
    }
    console.log("");

    // 4. Mavjud mahsulotlarni olish
    const existingProducts = await ProductModel.find({}, { name: 1 });
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));
    console.log(`📦 Bazada ${existingProducts.length} ta mahsulot mavjud\n`);

    // 5. Faqat yangi mahsulotlarni qo'shish
    console.log("🛒 Yangi mahsulotlar qo'shilmoqda...");
    let addedProducts = 0;
    let skippedProducts = 0;
    let categoryNotFound = 0;

    for (const product of data.products) {
      // Mavjud bo'lsa o'tkazib yuborish
      if (existingNames.has(product.name.toLowerCase())) {
        skippedProducts++;
        continue;
      }

      // Kategoriya ID sini topish
      const categoryId = categoryMap.get(product.category);
      if (!categoryId) {
        console.log(`   ⚠️  "${product.name}" - kategoriya topilmadi: "${product.category}"`);
        categoryNotFound++;
        continue;
      }

      // Yangi mahsulot qo'shish
      await ProductModel.create({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        categoryId: categoryId,
        image: product.image,
        isActive: product.isActive,
      });

      console.log(`   ✅ ${product.name} - qo'shildi`);
      addedProducts++;
    }

    console.log("");
    console.log("📊 Natija:");
    console.log(`   ✅ Qo'shildi: ${addedProducts} ta`);
    console.log(`   ⏭️  O'tkazib yuborildi (mavjud): ${skippedProducts} ta`);
    if (categoryNotFound > 0) {
      console.log(`   ⚠️  Kategoriya topilmadi: ${categoryNotFound} ta`);
    }

    // 6. Yakuniy statistika
    const totalProducts = await ProductModel.countDocuments();
    console.log(`\n📦 Jami mahsulotlar soni: ${totalProducts}`);

    console.log("\n✅ Import muvaffaqiyatli yakunlandi!");

    // 7. LanceDB ni yangilash haqida eslatma
    if (addedProducts > 0) {
      console.log("\n⚠️  ESLATMA: AI chatbot uchun LanceDB ni yangilang:");
      console.log("   npm run seed:ai\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Import xatosi:", error);
    process.exit(1);
  }
}

// Yordam
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
FreshMarket - Mahsulotlarni Import Qilish
=========================================

Foydalanish:
  npm run import:data     - Yangi mahsulotlarni qo'shish (mavjudlari o'tkazib yuboriladi)

JSON fayl joylashuvi:
  server/data/seed-data.json

Muhim:
  - Faqat YANGI mahsulotlar qo'shiladi
  - Mavjud mahsulotlar o'tkazib yuboriladi
  - Kategoriyalar qo'shilmaydi (mavjudlari ishlatiladi)

Import qilgandan so'ng:
  npm run seed:ai         - LanceDB ni yangilash (AI chatbot uchun)
`);
  process.exit(0);
}

importData();
