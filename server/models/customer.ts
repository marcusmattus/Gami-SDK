import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { partners } from './partner';
import { pointsTransactions } from './points-transaction';

/**
 * Customer record for partner businesses
 */
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  universalId: varchar('universal_id', { length: 64 }).notNull().unique(),
  externalCustomerId: varchar('external_customer_id', { length: 100 }).notNull(),
  partnerId: varchar('partner_id', { length: 64 }).notNull().references(() => partners.partnerId),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  name: varchar('name', { length: 255 }),
  points: integer('points').default(0).notNull(),
  walletPublicKey: varchar('wallet_public_key', { length: 255 }),
  qrCode: text('qr_code'),
  deepLink: text('deep_link'),
  metadata: jsonb('metadata'),
  lastActivity: timestamp('last_activity').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const customersRelations = relations(customers, ({ one, many }) => ({
  partner: one(partners, {
    fields: [customers.partnerId],
    references: [partners.partnerId]
  }),
  pointsTransactions: many(pointsTransactions)
}));

export const insertCustomerSchema = createInsertSchema(customers)
  .omit({ id: true, qrCode: true, deepLink: true, points: true, lastActivity: true, createdAt: true, updatedAt: true });

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;