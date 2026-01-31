import * as lancedb from "@lancedb/lancedb";
import path from "path";
import { fileURLToPath } from "url";
import { localEmbedder } from "./embedding";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ma'lumotlar saqlanadigan papka
const DB_HOLD = path.join(__dirname, "../../.lancedb");

export async function getProductTable() {
  const db = await lancedb.connect(DB_HOLD);
  
  // Embedding funksiyasi (LanceDB uchun wrapper)
  const embedder = {
    sourceColumn: "text",
    embed: async (batch: string[]) => {
      return await localEmbedder.generate(batch);
    }
  };

  try {
    // Agar jadval bo'lsa, uni ochamiz
    return await db.openTable("products");
  } catch {
    // Agar bo'lmasa, bo'sh jadval yaratamiz (birinchi marta)
    // Diqqat: Jadval yaratishda kamida bitta ma'lumot bo'lishi kerak yoki sxema berilishi kerak
    return null; 
  }
}

export async function createProductTable(data: any[]) {
  const db = await lancedb.connect(DB_HOLD);
  
  // Ma'lumotlarni tayyorlash
  const tableData = [];
  for (const p of data) {
    const text = `${p.name}. ${p.description}. Kategoriya: ${p.category}. Narxi: ${p.price} so'm.`;
    const vector = (await localEmbedder.generate([text]))[0];
    
    tableData.push({
      id: p.id.toString(),
      vector: vector,
      text: text,
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock
    });
  }

  // Jadvalni yaratamiz (yoki borini yangilaymiz)
  return await db.createTable("products", tableData, { mode: "overwrite" });
}

export async function searchProducts(query: string, limit: number = 3) {
  const table = await getProductTable();
  if (!table) return [];

  // Savolni vektorga aylantiramiz
  const queryVector = (await localEmbedder.generate([query]))[0];

  // Vektor bo'yicha qidiruv (Similarity search)
  const results = await table
    .vectorSearch(queryVector)
    .limit(limit)
    .toArray();

  return results;
}
