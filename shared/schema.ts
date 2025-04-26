import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, inactive
  environment: text("environment").notNull().default("development"), // development, production
  createdAt: timestamp("created_at").defaultNow(),
});

export const xpEvents = pgTable("xp_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  xpAmount: integer("xp_amount").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, testing
  createdAt: timestamp("created_at").defaultNow(),
});

export const userXpTransactions = pgTable("user_xp_transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  externalUserId: text("external_user_id").notNull(), // User ID from the client application
  eventId: integer("event_id").notNull().references(() => xpEvents.id),
  xpAmount: integer("xp_amount").notNull(),
  metadata: json("metadata"), // Additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  rewardAmount: integer("reward_amount"),
  status: text("status").notNull().default("active"), // active, inactive, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletIntegrations = pgTable("wallet_integrations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  walletType: text("wallet_type").notNull(), // phantom, solflare, walletconnect
  isEnabled: boolean("is_enabled").notNull().default(true),
  config: json("config"), // Additional configuration
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardDistributions = pgTable("reward_distributions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  externalUserId: text("external_user_id").notNull(),
  walletAddress: text("wallet_address").notNull(),
  tokenAmount: integer("token_amount").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const walrusMetadata = pgTable("walrus_metadata", {
  id: serial("id").primaryKey(),
  blobId: text("blob_id").notNull().unique(),
  metadata: json("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertXpEventSchema = createInsertSchema(xpEvents).omit({ id: true, createdAt: true });
export const insertUserXpTransactionSchema = createInsertSchema(userXpTransactions).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertWalletIntegrationSchema = createInsertSchema(walletIntegrations).omit({ id: true, createdAt: true });
export const insertRewardDistributionSchema = createInsertSchema(rewardDistributions).omit({ id: true, createdAt: true });
export const insertWalrusMetadataSchema = createInsertSchema(walrusMetadata).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type XpEvent = typeof xpEvents.$inferSelect;
export type InsertXpEvent = z.infer<typeof insertXpEventSchema>;

export type UserXpTransaction = typeof userXpTransactions.$inferSelect;
export type InsertUserXpTransaction = z.infer<typeof insertUserXpTransactionSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type WalletIntegration = typeof walletIntegrations.$inferSelect;
export type InsertWalletIntegration = z.infer<typeof insertWalletIntegrationSchema>;

export type RewardDistribution = typeof rewardDistributions.$inferSelect;
export type InsertRewardDistribution = z.infer<typeof insertRewardDistributionSchema>;

export type WalrusMetadata = typeof walrusMetadata.$inferSelect;
export type InsertWalrusMetadata = z.infer<typeof insertWalrusMetadataSchema>;

// API Schemas
export const trackEventSchema = z.object({
  userId: z.string(),
  event: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const connectWalletSchema = z.object({
  walletType: z.enum(["phantom", "solflare", "walletconnect"]),
});
