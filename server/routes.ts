import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  insertFabricSchema,
  insertAccessorySchema,
  insertProductSchema,
  insertDesignIdeaSchema,
  insertClientRequirementSchema,
  insertUserSchema,
  type User
} from "@shared/schema";

// Extend Express User interface properly - Remove passwordHash for security
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: 'guest' | 'editor' | 'admin';
      createdAt: Date;
    }
  }
}

// Helper functions for password hashing
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

// Authentication setup
function setupAuth(app: Express) {
  // CSRF Protection - Security headers
  app.use((req, res, next) => {
    // Prevent CSRF by ensuring same-site cookies
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Session configuration with CSRF protection
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'fallback-development-secret-please-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // CSRF protection - prevent cross-origin cookie sending
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // Use email instead of username
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.passwordHash))) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // SECURITY FIX: Remove passwordHash from req.user to prevent accidental exposure
      const { passwordHash, ...sanitizedUser } = user;
      done(null, sanitizedUser);
    } catch (error) {
      done(error);
    }
  });
}

// Permission middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: '需要登录' });
  }
  next();
};

const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: '需要登录' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: '权限不足' });
  }
  next();
};

// Operation logging helper for audit trail
async function logOperation(userId: string, method: string, route: string, action: string, entityType?: string, entityId?: string, metadata?: any) {
  try {
    await storage.createOperationLog({
      userId,
      method,
      route,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Failed to log operation:', error);
    // Don't fail the request if logging fails
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: '该邮箱已被注册' });
      }

      // SECURITY FIX: Force new users to be guests, ignore client-provided role
      const user = await storage.createUser({
        email: validatedData.email,
        name: validatedData.name,
        role: 'guest', // Always start as guest - admin must promote users
        passwordHash: await hashPassword(validatedData.passwordHash), // passwordHash field contains plain password from form
      });

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove passwordHash from response
        const { passwordHash, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: '注册失败，请检查输入数据' });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { passwordHash, ...userWithoutPassword } = req.user!;
    res.status(200).json(userWithoutPassword);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const { passwordHash, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // Admin-only routes for user management
  app.get("/api/users", requireRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "获取用户列表失败" });
    }
  });

  app.get("/api/operation-logs", requireRole(['admin']), async (req, res) => {
    try {
      const { userId, entityType, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (userId) filters.userId = userId as string;
      if (entityType) filters.entityType = entityType as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const logs = await storage.getOperationLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching operation logs:", error);
      res.status(500).json({ error: "获取操作日志失败" });
    }
  });

  // Fabrics API Routes
  app.get("/api/fabrics", async (req, res) => {
    try {
      const fabrics = await storage.getFabrics();
      res.json(fabrics);
    } catch (error) {
      console.error("Error fetching fabrics:", error);
      res.status(500).json({ error: "Failed to fetch fabrics" });
    }
  });

  app.get("/api/fabrics/:id", async (req, res) => {
    try {
      const fabric = await storage.getFabric(req.params.id);
      if (!fabric) {
        return res.status(404).json({ error: "Fabric not found" });
      }
      res.json(fabric);
    } catch (error) {
      console.error("Error fetching fabric:", error);
      res.status(500).json({ error: "Failed to fetch fabric" });
    }
  });

  app.post("/api/fabrics", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const validatedData = insertFabricSchema.parse(req.body);
      const fabric = await storage.createFabric(validatedData);
      res.status(201).json(fabric);
    } catch (error) {
      console.error("Error creating fabric:", error);
      res.status(400).json({ error: "Invalid fabric data" });
    }
  });

  app.put("/api/fabrics/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const partialData = insertFabricSchema.partial().parse(req.body);
      const fabric = await storage.updateFabric(req.params.id, partialData);
      if (!fabric) {
        return res.status(404).json({ error: "Fabric not found" });
      }
      res.json(fabric);
    } catch (error) {
      console.error("Error updating fabric:", error);
      res.status(400).json({ error: "Invalid fabric data" });
    }
  });

  app.delete("/api/fabrics/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const success = await storage.deleteFabric(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Fabric not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fabric:", error);
      res.status(500).json({ error: "Failed to delete fabric" });
    }
  });

  // Accessories API Routes
  app.get("/api/accessories", async (req, res) => {
    try {
      const accessories = await storage.getAccessories();
      res.json(accessories);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      res.status(500).json({ error: "Failed to fetch accessories" });
    }
  });

  app.get("/api/accessories/:id", async (req, res) => {
    try {
      const accessory = await storage.getAccessory(req.params.id);
      if (!accessory) {
        return res.status(404).json({ error: "Accessory not found" });
      }
      res.json(accessory);
    } catch (error) {
      console.error("Error fetching accessory:", error);
      res.status(500).json({ error: "Failed to fetch accessory" });
    }
  });

  app.post("/api/accessories", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const validatedData = insertAccessorySchema.parse(req.body);
      const accessory = await storage.createAccessory(validatedData);
      res.status(201).json(accessory);
    } catch (error) {
      console.error("Error creating accessory:", error);
      res.status(400).json({ error: "Invalid accessory data" });
    }
  });

  app.put("/api/accessories/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const partialData = insertAccessorySchema.partial().parse(req.body);
      const accessory = await storage.updateAccessory(req.params.id, partialData);
      if (!accessory) {
        return res.status(404).json({ error: "Accessory not found" });
      }
      res.json(accessory);
    } catch (error) {
      console.error("Error updating accessory:", error);
      res.status(400).json({ error: "Invalid accessory data" });
    }
  });

  app.delete("/api/accessories/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const success = await storage.deleteAccessory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Accessory not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting accessory:", error);
      res.status(500).json({ error: "Failed to delete accessory" });
    }
  });

  // Products API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const partialData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, partialData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Design Ideas API Routes
  app.get("/api/design-ideas", async (req, res) => {
    try {
      const ideas = await storage.getDesignIdeas();
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching design ideas:", error);
      res.status(500).json({ error: "Failed to fetch design ideas" });
    }
  });

  app.get("/api/design-ideas/:id", async (req, res) => {
    try {
      const idea = await storage.getDesignIdea(req.params.id);
      if (!idea) {
        return res.status(404).json({ error: "Design idea not found" });
      }
      res.json(idea);
    } catch (error) {
      console.error("Error fetching design idea:", error);
      res.status(500).json({ error: "Failed to fetch design idea" });
    }
  });

  app.post("/api/design-ideas", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDesignIdeaSchema.parse(req.body);
      const idea = await storage.createDesignIdea(validatedData);
      res.status(201).json(idea);
    } catch (error) {
      console.error("Error creating design idea:", error);
      res.status(400).json({ error: "Invalid design idea data" });
    }
  });

  app.put("/api/design-ideas/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const partialData = insertDesignIdeaSchema.partial().parse(req.body);
      const idea = await storage.updateDesignIdea(req.params.id, partialData);
      if (!idea) {
        return res.status(404).json({ error: "Design idea not found" });
      }
      res.json(idea);
    } catch (error) {
      console.error("Error updating design idea:", error);
      res.status(400).json({ error: "Invalid design idea data" });
    }
  });

  app.delete("/api/design-ideas/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const success = await storage.deleteDesignIdea(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Design idea not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting design idea:", error);
      res.status(500).json({ error: "Failed to delete design idea" });
    }
  });

  // Client Requirements API Routes
  app.get("/api/client-requirements", async (req, res) => {
    try {
      const requirements = await storage.getClientRequirements();
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching client requirements:", error);
      res.status(500).json({ error: "Failed to fetch client requirements" });
    }
  });

  app.get("/api/client-requirements/:id", async (req, res) => {
    try {
      const requirement = await storage.getClientRequirement(req.params.id);
      if (!requirement) {
        return res.status(404).json({ error: "Client requirement not found" });
      }
      res.json(requirement);
    } catch (error) {
      console.error("Error fetching client requirement:", error);
      res.status(500).json({ error: "Failed to fetch client requirement" });
    }
  });

  app.post("/api/client-requirements", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientRequirementSchema.parse(req.body);
      const requirement = await storage.createClientRequirement(validatedData);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating client requirement:", error);
      res.status(400).json({ error: "Invalid client requirement data" });
    }
  });

  app.put("/api/client-requirements/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const partialData = insertClientRequirementSchema.partial().parse(req.body);
      const requirement = await storage.updateClientRequirement(req.params.id, partialData);
      if (!requirement) {
        return res.status(404).json({ error: "Client requirement not found" });
      }
      res.json(requirement);
    } catch (error) {
      console.error("Error updating client requirement:", error);
      res.status(400).json({ error: "Invalid client requirement data" });
    }
  });

  app.delete("/api/client-requirements/:id", requireRole(['editor', 'admin']), async (req, res) => {
    try {
      const success = await storage.deleteClientRequirement(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client requirement not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client requirement:", error);
      res.status(500).json({ error: "Failed to delete client requirement" });
    }
  });

  // Statistics API Route
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
