import { 
  type Fabric, type InsertFabric,
  type Accessory, type InsertAccessory,
  type Product, type InsertProduct,
  type DesignIdea, type InsertDesignIdea,
  type ClientRequirement, type InsertClientRequirement,
  type User, type InsertUser,
  type Session, type InsertSession,
  type OperationLog, type InsertOperationLog,
  fabrics, accessories, products, designIdeas, clientRequirements,
  users, sessions, operationLogs
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { neonConfig, Pool } from "@neondatabase/serverless";
import session from "express-session";
import connectPg from "connect-pg-simple";
import ws from 'ws';

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;

export interface IStorage {
  // Fabrics
  getFabrics(): Promise<Fabric[]>;
  getFabric(id: string): Promise<Fabric | undefined>;
  createFabric(fabric: InsertFabric): Promise<Fabric>;
  updateFabric(id: string, fabric: Partial<InsertFabric>): Promise<Fabric | undefined>;
  deleteFabric(id: string): Promise<boolean>;

  // Accessories
  getAccessories(): Promise<Accessory[]>;
  getAccessory(id: string): Promise<Accessory | undefined>;
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  updateAccessory(id: string, accessory: Partial<InsertAccessory>): Promise<Accessory | undefined>;
  deleteAccessory(id: string): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Design Ideas
  getDesignIdeas(): Promise<DesignIdea[]>;
  getDesignIdea(id: string): Promise<DesignIdea | undefined>;
  createDesignIdea(idea: InsertDesignIdea): Promise<DesignIdea>;
  updateDesignIdea(id: string, idea: Partial<InsertDesignIdea>): Promise<DesignIdea | undefined>;
  deleteDesignIdea(id: string): Promise<boolean>;

  // Client Requirements
  getClientRequirements(): Promise<ClientRequirement[]>;
  getClientRequirement(id: string): Promise<ClientRequirement | undefined>;
  createClientRequirement(requirement: InsertClientRequirement): Promise<ClientRequirement>;
  updateClientRequirement(id: string, requirement: Partial<InsertClientRequirement>): Promise<ClientRequirement | undefined>;
  deleteClientRequirement(id: string): Promise<boolean>;

  // Statistics
  getStatistics(): Promise<{
    totalFabrics: number;
    totalAccessories: number;
    totalProducts: number;
    activeDesignIdeas: number;
    pendingRequirements: number;
  }>;

  // Authentication
  sessionStore: session.Store;
  
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<number>;

  // Operation logging
  createOperationLog(log: InsertOperationLog): Promise<OperationLog>;
  getOperationLogs(filters?: { userId?: string; entityType?: string; startDate?: Date; endDate?: Date }): Promise<OperationLog[]>;
}

export class DatabaseStorage implements IStorage {
  private db;
  private pool;
  public sessionStore: session.Store;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    this.db = drizzle(this.pool);
    
    // Initialize PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true,
    });
  }

  // Fabrics
  async getFabrics(): Promise<Fabric[]> {
    return await this.db.select().from(fabrics);
  }

  async getFabric(id: string): Promise<Fabric | undefined> {
    const result = await this.db.select().from(fabrics).where(eq(fabrics.id, id));
    return result[0];
  }

  async createFabric(fabric: InsertFabric): Promise<Fabric> {
    const result = await this.db.insert(fabrics).values(fabric).returning();
    return result[0];
  }

  async updateFabric(id: string, fabric: Partial<InsertFabric>): Promise<Fabric | undefined> {
    const result = await this.db.update(fabrics).set(fabric).where(eq(fabrics.id, id)).returning();
    return result[0];
  }

  async deleteFabric(id: string): Promise<boolean> {
    const result = await this.db.delete(fabrics).where(eq(fabrics.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Accessories
  async getAccessories(): Promise<Accessory[]> {
    return await this.db.select().from(accessories);
  }

  async getAccessory(id: string): Promise<Accessory | undefined> {
    const result = await this.db.select().from(accessories).where(eq(accessories.id, id));
    return result[0];
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const result = await this.db.insert(accessories).values(accessory).returning();
    return result[0];
  }

  async updateAccessory(id: string, accessory: Partial<InsertAccessory>): Promise<Accessory | undefined> {
    const result = await this.db.update(accessories).set(accessory).where(eq(accessories.id, id)).returning();
    return result[0];
  }

  async deleteAccessory(id: string): Promise<boolean> {
    const result = await this.db.delete(accessories).where(eq(accessories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await this.db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await this.db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await this.db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Design Ideas
  async getDesignIdeas(): Promise<DesignIdea[]> {
    return await this.db.select().from(designIdeas);
  }

  async getDesignIdea(id: string): Promise<DesignIdea | undefined> {
    const result = await this.db.select().from(designIdeas).where(eq(designIdeas.id, id));
    return result[0];
  }

  async createDesignIdea(idea: InsertDesignIdea): Promise<DesignIdea> {
    const result = await this.db.insert(designIdeas).values(idea).returning();
    return result[0];
  }

  async updateDesignIdea(id: string, idea: Partial<InsertDesignIdea>): Promise<DesignIdea | undefined> {
    const result = await this.db.update(designIdeas).set(idea).where(eq(designIdeas.id, id)).returning();
    return result[0];
  }

  async deleteDesignIdea(id: string): Promise<boolean> {
    const result = await this.db.delete(designIdeas).where(eq(designIdeas.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Client Requirements
  async getClientRequirements(): Promise<ClientRequirement[]> {
    return await this.db.select().from(clientRequirements);
  }

  async getClientRequirement(id: string): Promise<ClientRequirement | undefined> {
    const result = await this.db.select().from(clientRequirements).where(eq(clientRequirements.id, id));
    return result[0];
  }

  async createClientRequirement(requirement: InsertClientRequirement): Promise<ClientRequirement> {
    const result = await this.db.insert(clientRequirements).values(requirement).returning();
    return result[0];
  }

  async updateClientRequirement(id: string, requirement: Partial<InsertClientRequirement>): Promise<ClientRequirement | undefined> {
    const result = await this.db.update(clientRequirements).set(requirement).where(eq(clientRequirements.id, id)).returning();
    return result[0];
  }

  async deleteClientRequirement(id: string): Promise<boolean> {
    const result = await this.db.delete(clientRequirements).where(eq(clientRequirements.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getStatistics() {
    const [fabricCount, accessoryCount, productCount, designIdeaCount, clientRequirementCount] = await Promise.all([
      this.db.select({ count: sql`count(*)` }).from(fabrics),
      this.db.select({ count: sql`count(*)` }).from(accessories), 
      this.db.select({ count: sql`count(*)` }).from(products),
      this.db.select({ count: sql`count(*)` }).from(designIdeas).where(eq(designIdeas.status, 'active')),
      this.db.select({ count: sql`count(*)` }).from(clientRequirements).where(eq(clientRequirements.status, 'pending'))
    ]);

    return {
      totalFabrics: Number(fabricCount[0]?.count) || 0,
      totalAccessories: Number(accessoryCount[0]?.count) || 0, 
      totalProducts: Number(productCount[0]?.count) || 0,
      activeDesignIdeas: Number(designIdeaCount[0]?.count) || 0,
      pendingRequirements: Number(clientRequirementCount[0]?.count) || 0
    };
  }

  // User management
  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Session management  
  async createSession(session: InsertSession): Promise<Session> {
    const result = await this.db.insert(sessions).values(session).returning();
    return result[0];
  }

  async getSession(token: string): Promise<Session | undefined> {
    const result = await this.db.select().from(sessions).where(eq(sessions.token, token));
    return result[0];
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.token, token));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.db.delete(sessions).where(sql`${sessions.expiresAt} < ${now}`);
    return result.rowCount ?? 0;
  }

  // Operation logging
  async createOperationLog(log: InsertOperationLog): Promise<OperationLog> {
    const result = await this.db.insert(operationLogs).values(log).returning();
    return result[0];
  }

  async getOperationLogs(filters?: { userId?: string; entityType?: string; startDate?: Date; endDate?: Date }): Promise<OperationLog[]> {
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(operationLogs.userId, filters.userId));
    }
    if (filters?.entityType) {
      conditions.push(eq(operationLogs.entityType, filters.entityType));
    }
    if (filters?.startDate) {
      conditions.push(gte(operationLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(operationLogs.createdAt, filters.endDate));
    }
    
    const query = this.db.select().from(operationLogs);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await query
      .where(whereClause)
      .orderBy(sql`${operationLogs.createdAt} DESC`);
  }
}

export const storage = new DatabaseStorage();
