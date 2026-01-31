import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ProductWithCategory,
  type CartItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  // Products
  getProducts(): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Cart
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Orders
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));
    
    return result.map((row) => ({
      ...row.products,
      category: row.categories || undefined,
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].products,
      category: result[0].categories || undefined,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return result.map((row) => ({
      ...row.cart_items,
      product: row.products,
    }));
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return result[0];
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)));
    
    if (existing[0]) {
      // Update quantity
      const result = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeFromCart(id);
      return undefined;
    }
    const result = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Orders
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    const result: OrderWithItems[] = [];
    for (const order of ordersResult) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
      
      result.push({
        ...order,
        items: items.map((item) => ({
          ...item.order_items,
          product: item.products || undefined,
        })),
      });
    }
    
    return result;
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const ordersResult = await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    const result: OrderWithItems[] = [];
    for (const order of ordersResult) {
      const items = await db
        .select()
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));
      
      result.push({
        ...order,
        items: items.map((item) => ({
          ...item.order_items,
          product: item.products || undefined,
        })),
      });
    }
    
    return result;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id));
    if (!orderResult[0]) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));
    
    return {
      ...orderResult[0],
      items: items.map((item) => ({
        ...item.order_items,
        product: item.products || undefined,
      })),
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
