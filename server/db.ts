import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("MongoDB ga muvaffaqiyatli ulandi");
  } catch (error) {
    console.error("MongoDB ga ulanishda xatolik:", error);
    process.exit(1);
  }
}

export default mongoose;
