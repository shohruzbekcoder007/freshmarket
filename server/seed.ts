import { db } from "./db";
import { users, categories, products } from "@shared/schema";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Checking for seed data...");
  
  // Check if data already exists
  const existingCategories = await db.select().from(categories);
  if (existingCategories.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await db.insert(users).values({
    username: "admin",
    email: "admin@freshmarket.uz",
    password: hashedPassword,
    role: "admin",
    phone: "+998 90 123 45 67",
    address: "Toshkent, Mirzo Ulug'bek tumani",
  });

  // Create test user
  const userPassword = await bcrypt.hash("user123", 10);
  await db.insert(users).values({
    username: "testuser",
    email: "user@freshmarket.uz",
    password: userPassword,
    role: "user",
    phone: "+998 91 234 56 78",
    address: "Toshkent, Chilonzor tumani",
  });

  // Create categories
  const categoryData = [
    { name: "Mevalar", description: "Toza va yangi mevalar", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200" },
    { name: "Sabzavotlar", description: "Yangi sabzavotlar", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200" },
    { name: "Sut mahsulotlari", description: "Sut va sut mahsulotlari", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200" },
    { name: "Non mahsulotlari", description: "Yangi pishirilgan nonlar", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200" },
    { name: "Go'sht mahsulotlari", description: "Yangi go'sht", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200" },
    { name: "Ichimliklar", description: "Sharbatlar va ichimliklar", image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200" },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  
  // Create products
  const productData = [
    // Mevalar
    { name: "Olma (Qizil)", description: "Yangi qizil olmalar, O'zbekistondan", price: "15000", stock: 100, unit: "kg", categoryId: insertedCategories[0].id, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", isActive: true },
    { name: "Banan", description: "Ekvadordan import qilingan toza bananlar", price: "25000", stock: 80, unit: "kg", categoryId: insertedCategories[0].id, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400", isActive: true },
    { name: "Apelsin", description: "Shirin va suvli apelsinlar", price: "22000", stock: 60, unit: "kg", categoryId: insertedCategories[0].id, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", isActive: true },
    { name: "Uzum (Qora)", description: "Shirin qora uzum", price: "35000", stock: 40, unit: "kg", categoryId: insertedCategories[0].id, image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400", isActive: true },
    
    // Sabzavotlar
    { name: "Pomidor", description: "Yangi qizil pomidorlar", price: "12000", stock: 150, unit: "kg", categoryId: insertedCategories[1].id, image: "https://images.unsplash.com/photo-1546470427-227c7369a62b?w=400", isActive: true },
    { name: "Bodring", description: "Toza bodringlar", price: "8000", stock: 120, unit: "kg", categoryId: insertedCategories[1].id, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400", isActive: true },
    { name: "Kartoshka", description: "Yangi kartoshka", price: "7000", stock: 200, unit: "kg", categoryId: insertedCategories[1].id, image: "https://images.unsplash.com/photo-1518977676601-b53f82ber?w=400", isActive: true },
    { name: "Sabzi", description: "Toza sabzi", price: "6000", stock: 100, unit: "kg", categoryId: insertedCategories[1].id, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400", isActive: true },
    
    // Sut mahsulotlari
    { name: "Sut (1 litr)", description: "Toza sigir suti", price: "12000", stock: 50, unit: "dona", categoryId: insertedCategories[2].id, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400", isActive: true },
    { name: "Qatiq (1 kg)", description: "Uy qatiqi", price: "18000", stock: 40, unit: "dona", categoryId: insertedCategories[2].id, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400", isActive: true },
    { name: "Pishloq (1 kg)", description: "Mahalliy pishloq", price: "85000", stock: 25, unit: "kg", categoryId: insertedCategories[2].id, image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400", isActive: true },
    
    // Non mahsulotlari
    { name: "O'zbek noni", description: "An'anaviy tandirda pishirilgan non", price: "5000", stock: 100, unit: "dona", categoryId: insertedCategories[3].id, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", isActive: true },
    { name: "Patir", description: "Yumshoq patir", price: "8000", stock: 60, unit: "dona", categoryId: insertedCategories[3].id, image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400", isActive: true },
    
    // Go'sht
    { name: "Mol go'shti", description: "Yangi mol go'shti", price: "95000", stock: 30, unit: "kg", categoryId: insertedCategories[4].id, image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400", isActive: true },
    { name: "Tovuq go'shti", description: "Broiler tovuq", price: "45000", stock: 50, unit: "kg", categoryId: insertedCategories[4].id, image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400", isActive: true },
    
    // Ichimliklar
    { name: "Olma sharbati (1L)", description: "100% natural olma sharbati", price: "15000", stock: 80, unit: "dona", categoryId: insertedCategories[5].id, image: "https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400", isActive: true },
    { name: "Mineral suv (1.5L)", description: "Gazlangan mineral suv", price: "5000", stock: 200, unit: "dona", categoryId: insertedCategories[5].id, image: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400", isActive: true },
  ];

  await db.insert(products).values(productData);

  console.log("Database seeded successfully!");
  console.log("Admin credentials: admin@freshmarket.uz / admin123");
  console.log("User credentials: user@freshmarket.uz / user123");
}
