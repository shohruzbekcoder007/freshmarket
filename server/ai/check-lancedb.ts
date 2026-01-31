import { getProductTable } from "./lancedb";

async function checkDB() {
  console.log("Bazani tekshirish...");
  try {
    const table = await getProductTable();
    
    if (!table) {
      console.log("Jadval topilmadi! Avval 'npm run seed:ai' ni ishga tushiring.");
      return;
    }

    const count = await table.countRows();
    console.log(`\n✅ BAZADA JAMI MAHSULOTLAR: ${count} ta`);

    if (count > 0) {
      console.log("\n--- Dastlabki 3 ta mahsulot ---");
      const products = await table.query().limit(3).toArray();
      products.forEach((p: any) => {
        console.log(`- ${p.name} (${p.price} so'm) [${p.category}]`);
      });
      console.log("-------------------------------\n");
    }

  } catch (error) {
    console.error("Xatolik:", error);
  }
}

checkDB();
