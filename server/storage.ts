import {
  UserModel,
  CategoryModel,
  ProductModel,
  CartItemModel,
  OrderModel,
  OrderItemModel,
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

// Helper function to convert MongoDB document to plain object
function toUser(doc: any): User {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    password: doc.password,
    role: doc.role,
    phone: doc.phone || null,
    address: doc.address || null,
    createdAt: doc.createdAt || null,
  };
}

function toCategory(doc: any): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || null,
    image: doc.image || null,
  };
}

function toProduct(doc: any): Product {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || null,
    price: doc.price.toString(),
    image: doc.image || null,
    categoryId: doc.categoryId?.toString() || null,
    stock: doc.stock || 0,
    unit: doc.unit || "dona",
    isActive: doc.isActive ?? true,
    createdAt: doc.createdAt || null,
  };
}

function toCartItem(doc: any): CartItem {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    productId: doc.productId.toString(),
    quantity: doc.quantity,
  };
}

function toOrder(doc: any): Order {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    status: doc.status,
    totalAmount: doc.totalAmount.toString(),
    shippingAddress: doc.shippingAddress,
    phone: doc.phone,
    notes: doc.notes || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

function toOrderItem(doc: any): OrderItem {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId.toString(),
    productId: doc.productId.toString(),
    quantity: doc.quantity,
    price: doc.price.toString(),
    productName: doc.productName,
  };
}

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
    const doc = await UserModel.findById(id);
    return doc ? toUser(doc) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ email });
    return doc ? toUser(doc) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username });
    return doc ? toUser(doc) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const doc = await UserModel.create(user);
    return toUser(doc);
  }

  async getAllUsers(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map(toUser);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const docs = await CategoryModel.find();
    return docs.map(toCategory);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const doc = await CategoryModel.findById(id);
    return doc ? toCategory(doc) : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const doc = await CategoryModel.create(category);
    return toCategory(doc);
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const doc = await CategoryModel.findByIdAndUpdate(id, category, { new: true });
    return doc ? toCategory(doc) : undefined;
  }

  async deleteCategory(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  }

  // Products
  async getProducts(): Promise<ProductWithCategory[]> {
    const docs = await ProductModel.find().sort({ createdAt: -1 });
    const result: ProductWithCategory[] = [];

    for (const doc of docs) {
      const product = toProduct(doc);
      let category: Category | undefined;

      if (doc.categoryId) {
        const categoryDoc = await CategoryModel.findById(doc.categoryId);
        if (categoryDoc) {
          category = toCategory(categoryDoc);
        }
      }

      result.push({ ...product, category });
    }

    return result;
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const doc = await ProductModel.findById(id);
    if (!doc) return undefined;

    const product = toProduct(doc);
    let category: Category | undefined;

    if (doc.categoryId) {
      const categoryDoc = await CategoryModel.findById(doc.categoryId);
      if (categoryDoc) {
        category = toCategory(categoryDoc);
      }
    }

    return { ...product, category };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const doc = await ProductModel.create({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    });
    return toProduct(doc);
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateData: any = { ...product };
    if (product.price !== undefined) {
      updateData.price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    }
    const doc = await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
    return doc ? toProduct(doc) : undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const docs = await CartItemModel.find({ userId });
    const result: CartItemWithProduct[] = [];

    for (const doc of docs) {
      const cartItem = toCartItem(doc);
      const productDoc = await ProductModel.findById(doc.productId);

      if (productDoc) {
        result.push({
          ...cartItem,
          product: toProduct(productDoc),
        });
      }
    }

    return result;
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const doc = await CartItemModel.findById(id);
    return doc ? toCartItem(doc) : undefined;
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existing = await CartItemModel.findOne({
      userId: item.userId,
      productId: item.productId,
    });

    if (existing) {
      // Update quantity
      existing.quantity += item.quantity || 1;
      await existing.save();
      return toCartItem(existing);
    }

    const doc = await CartItemModel.create(item);
    return toCartItem(doc);
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeFromCart(id);
      return undefined;
    }
    const doc = await CartItemModel.findByIdAndUpdate(id, { quantity }, { new: true });
    return doc ? toCartItem(doc) : undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await CartItemModel.findByIdAndDelete(id);
  }

  async clearCart(userId: string): Promise<void> {
    await CartItemModel.deleteMany({ userId });
  }

  // Orders
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const orderDocs = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    const result: OrderWithItems[] = [];

    for (const orderDoc of orderDocs) {
      const order = toOrder(orderDoc);
      const itemDocs = await OrderItemModel.find({ orderId: orderDoc._id });

      const items: (OrderItem & { product?: Product })[] = [];
      for (const itemDoc of itemDocs) {
        const item = toOrderItem(itemDoc);
        const productDoc = await ProductModel.findById(itemDoc.productId);
        items.push({
          ...item,
          product: productDoc ? toProduct(productDoc) : undefined,
        });
      }

      result.push({ ...order, items });
    }

    return result;
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const orderDocs = await OrderModel.find().sort({ createdAt: -1 });
    const result: OrderWithItems[] = [];

    for (const orderDoc of orderDocs) {
      const order = toOrder(orderDoc);
      const itemDocs = await OrderItemModel.find({ orderId: orderDoc._id });

      const items: (OrderItem & { product?: Product })[] = [];
      for (const itemDoc of itemDocs) {
        const item = toOrderItem(itemDoc);
        const productDoc = await ProductModel.findById(itemDoc.productId);
        items.push({
          ...item,
          product: productDoc ? toProduct(productDoc) : undefined,
        });
      }

      result.push({ ...order, items });
    }

    return result;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const orderDoc = await OrderModel.findById(id);
    if (!orderDoc) return undefined;

    const order = toOrder(orderDoc);
    const itemDocs = await OrderItemModel.find({ orderId: orderDoc._id });

    const items: (OrderItem & { product?: Product })[] = [];
    for (const itemDoc of itemDocs) {
      const item = toOrderItem(itemDoc);
      const productDoc = await ProductModel.findById(itemDoc.productId);
      items.push({
        ...item,
        product: productDoc ? toProduct(productDoc) : undefined,
      });
    }

    return { ...order, items };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const doc = await OrderModel.create({
      ...order,
      totalAmount: typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount,
    });
    return toOrder(doc);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return doc ? toOrder(doc) : undefined;
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const doc = await OrderItemModel.create({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    });
    return toOrderItem(doc);
  }
}

export const storage = new DatabaseStorage();
