import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { insertUserSchema, insertCartItemSchema } from "@shared/schema";
import { searchProducts } from "./ai/lancedb";
import { generateChatResponseStream } from "./ai/openai";

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// JWT Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token talab qilinadi" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Token yaroqsiz" });
    }
    req.user = decoded;
    next();
  });
}

// Admin Middleware
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin huquqi talab qilinadi" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============ AUTH ROUTES ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri", errors: validationResult.error.errors });
      }
      
      const { username, email, password, phone, address } = validationResult.data;
      
      // Check if user exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Bu foydalanuvchi nomi band" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "user",
        phone,
        address,
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Ro'yxatdan o'tishda xatolik" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
      }
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Tizimga kirishda xatolik" });
    }
  });

  // ============ CATEGORY ROUTES ============
  
  // Get all categories (public)
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Kategoriyalarni olishda xatolik" });
    }
  });

  // ============ PRODUCT ROUTES ============
  
  // Get all products (public)
  app.get("/api/products", async (req, res) => {
    try {
      let products = await storage.getProducts();
      
      // Filter only active products for public
      products = products.filter(p => p.isActive !== false);
      
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Mahsulotlarni olishda xatolik" });
    }
  });

  // Get single product (public)
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Mahsulotni olishda xatolik" });
    }
  });

  // ============ CART ROUTES ============
  
  // Get cart items
  app.get("/api/cart", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const items = await storage.getCartItems(req.user!.id);
      res.json(items);
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Savatchani olishda xatolik" });
    }
  });

  // Add to cart
  app.post("/api/cart", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertCartItemSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      if (!validationResult.success) {
        return res.status(400).json({ message: "Ma'lumotlar noto'g'ri", errors: validationResult.error.errors });
      }
      
      const { productId, quantity } = validationResult.data;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      
      const item = await storage.addToCart({
        userId: req.user!.id,
        productId,
        quantity: quantity || 1,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Savatchaga qo'shishda xatolik" });
    }
  });

  // Update cart item
  app.patch("/api/cart/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      res.json(item);
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ message: "Savatchani yangilashda xatolik" });
    }
  });

  // Remove from cart
  app.delete("/api/cart/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "O'chirildi" });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Savatchadan o'chirishda xatolik" });
    }
  });

  // Clear cart
  app.delete("/api/cart", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.clearCart(req.user!.id);
      res.json({ message: "Savatcha tozalandi" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Savatchani tozalashda xatolik" });
    }
  });

  // ============ ORDER ROUTES ============
  
  // Get user orders
  app.get("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Buyurtmalarni olishda xatolik" });
    }
  });

  // Create order
  app.post("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { shippingAddress, phone, notes } = req.body;
      
      // Validate required fields
      if (!shippingAddress || !phone) {
        return res.status(400).json({ message: "Manzil va telefon raqami talab qilinadi" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.user!.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Savatcha bo'sh" });
      }
      
      // Calculate total
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
      }, 0);
      
      // Create order
      const order = await storage.createOrder({
        userId: req.user!.id,
        status: "pending",
        totalAmount: totalAmount.toString(),
        shippingAddress,
        phone,
        notes,
      });
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.name,
        });
      }
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      res.json(order);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Buyurtma berishda xatolik" });
    }
  });

  // ============ ADMIN ROUTES ============
  
  // Get all products (admin)
  app.get("/api/admin/products", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Admin get products error:", error);
      res.status(500).json({ message: "Mahsulotlarni olishda xatolik" });
    }
  });

  // Create product (admin)
  app.post("/api/admin/products", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error) {
      console.error("Admin create product error:", error);
      res.status(500).json({ message: "Mahsulot yaratishda xatolik" });
    }
  });

  // Update product (admin)
  app.patch("/api/admin/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      console.error("Admin update product error:", error);
      res.status(500).json({ message: "Mahsulotni yangilashda xatolik" });
    }
  });

  // Delete product (admin)
  app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "O'chirildi" });
    } catch (error) {
      console.error("Admin delete product error:", error);
      res.status(500).json({ message: "Mahsulotni o'chirishda xatolik" });
    }
  });

  // Create category (admin)
  app.post("/api/admin/categories", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Admin create category error:", error);
      res.status(500).json({ message: "Kategoriya yaratishda xatolik" });
    }
  });

  // Update category (admin)
  app.patch("/api/admin/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Admin update category error:", error);
      res.status(500).json({ message: "Kategoriyani yangilashda xatolik" });
    }
  });

  // Delete category (admin)
  app.delete("/api/admin/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.json({ message: "O'chirildi" });
    } catch (error) {
      console.error("Admin delete category error:", error);
      res.status(500).json({ message: "Kategoriyani o'chirishda xatolik" });
    }
  });

  // Get all orders (admin)
  app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Admin get orders error:", error);
      res.status(500).json({ message: "Buyurtmalarni olishda xatolik" });
    }
  });

  // Update order status (admin)
  app.patch("/api/admin/orders/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      console.error("Admin update order error:", error);
      res.status(500).json({ message: "Buyurtmani yangilashda xatolik" });
    }
  });

  // Get all users (admin)
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({ message: "Foydalanuvchilarni olishda xatolik" });
    }
  });

  // ============ CHATBOT ROUTE ============
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Xabar yuborilmadi" });
      }

      // 1. Bazadan o'xshash mahsulotlarni qidirish
      const results = await searchProducts(message, 3);

      // 2. Headerlarni sozlash (Streaming uchun)
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      // 3. OpenAI Stream
      const stream = await generateChatResponseStream(message, results);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ reply: "Tizimda xatolik yuz berdi." });
      } else {
        res.end();
      }
    }
  });

  return httpServer;
}
