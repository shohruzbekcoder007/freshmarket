import fs from "fs";
import path from "path";
import { createProductTable } from "./lancedb";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedLanceDB() {
  console.log("Starting LanceDB seeding...");

  try {
    const dataPath = path.join(__dirname, "products.json");
    if (!fs.existsSync(dataPath)) {
      console.error("products.json topilmadi!");
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const products = JSON.parse(rawData);

    if (!products || products.length === 0) {
      console.log("JSON faylda mahsulotlar topilmadi.");
      return;
    }

    console.log(`LanceDB-ga ${products.length} ta mahsulot yuklanmoqda...`);
    await createProductTable(products);

    console.log("LanceDB seeding muvaffaqiyatli yakunlandi!");
  } catch (error) {
    console.error("LanceDB seedingda xatolik:", error);
  }
}

// To'g'ridan-to'g'ri chaqirilganda ishga tushadi
seedLanceDB();

export { seedLanceDB };
