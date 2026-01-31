import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// ============ USER ============
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);

export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["user", "admin"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  createdAt?: Date | null;
};

// ============ CATEGORY ============
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
});

export const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
};

// ============ PRODUCT ============
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId?: mongoose.Types.ObjectId;
  stock: number;
  unit: string;
  isActive: boolean;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: "dona" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const ProductModel = mongoose.model<IProduct>("Product", productSchema);

export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  stock: z.number().optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  image?: string | null;
  categoryId?: string | null;
  stock: number;
  unit?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
};

// ============ CART ITEM ============
export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

const cartItemSchema = new Schema<ICartItem>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

export const CartItemModel = mongoose.model<ICartItem>("CartItem", cartItemSchema);

export const insertCartItemSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().optional(),
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
};

// ============ ORDER ============
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "pending" },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export const insertOrderSchema = z.object({
  userId: z.string(),
  status: z.string().optional(),
  totalAmount: z.union([z.string(), z.number()]),
  shippingAddress: z.string(),
  phone: z.string(),
  notes: z.string().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = {
  id: string;
  userId: string;
  status: string;
  totalAmount: string;
  shippingAddress: string;
  phone: string;
  notes?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

// ============ ORDER ITEM ============
export interface IOrderItem extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  productName: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productName: { type: String, required: true },
});

export const OrderItemModel = mongoose.model<IOrderItem>("OrderItem", orderItemSchema);

export const insertOrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: z.union([z.string(), z.number()]),
  productName: z.string(),
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  productName: string;
};

// ============ EXTENDED TYPES ============
export type ProductWithCategory = Product & { category?: Category };
export type CartItemWithProduct = CartItem & { product: Product };
export type OrderWithItems = Order & { items: (OrderItem & { product?: Product })[] };
