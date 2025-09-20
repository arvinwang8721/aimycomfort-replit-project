import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fabrics = pgTable("fabrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(),
  width: integer("width").notNull(), // in cm
  gramWeight: integer("gram_weight").notNull(), // grams per square meter
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessories = pgTable("accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const designIdeas = pgTable("design_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrls: text("image_urls").array(),
  demandAnalysis: text("demand_analysis"),
  negativeReviews: text("negative_reviews"),
  redesignReason: text("redesign_reason"),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  createdBy: text("created_by").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  phase: text("phase").notNull().default("produced"), // produced, designing
  coverCost: decimal("cover_cost", { precision: 10, scale: 2 }),
  innerCoreCost: decimal("inner_core_cost", { precision: 10, scale: 2 }),
  packageCost: decimal("package_cost", { precision: 10, scale: 2 }),
  generalCost: decimal("general_cost", { precision: 10, scale: 2 }),
  modelUrl: text("model_url"), // 3D model URL
  status: text("status").notNull().default("active"), // active, discontinued
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientRequirements = pgTable("client_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("guest"), // guest, editor, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operationLogs = pgTable("operation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  method: text("method").notNull(), // POST, PUT, DELETE
  route: text("route").notNull(), // /api/fabrics, etc
  entityType: text("entity_type"), // fabrics, accessories, etc
  entityId: varchar("entity_id"), // ID of affected entity
  action: text("action").notNull(), // create, update, delete
  metadata: text("metadata"), // JSON string with additional details
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertFabricSchema = createInsertSchema(fabrics).omit({ id: true, createdAt: true });
export const insertAccessorySchema = createInsertSchema(accessories).omit({ id: true, createdAt: true });
export const insertDesignIdeaSchema = createInsertSchema(designIdeas).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertClientRequirementSchema = createInsertSchema(clientRequirements).omit({ id: true, createdAt: true });

// Authentication insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export const insertOperationLogSchema = createInsertSchema(operationLogs).omit({ id: true, createdAt: true });

// Types
export type InsertFabric = z.infer<typeof insertFabricSchema>;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
export type InsertDesignIdea = z.infer<typeof insertDesignIdeaSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertClientRequirement = z.infer<typeof insertClientRequirementSchema>;

// Authentication types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertOperationLog = z.infer<typeof insertOperationLogSchema>;

export type Fabric = typeof fabrics.$inferSelect;
export type Accessory = typeof accessories.$inferSelect;
export type DesignIdea = typeof designIdeas.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ClientRequirement = typeof clientRequirements.$inferSelect;

// Authentication select types
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type OperationLog = typeof operationLogs.$inferSelect;