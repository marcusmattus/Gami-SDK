import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customers } from './customer';

/**
 * Transaction types for point transactions
 */
export enum TransactionType {
  AWARD = 'award',
  REDEEM = 'redeem'
}

/**
 * Points transaction record for customer points
 */
export const pointsTransactions = pgTable('points_transactions', {
  id: serial('id').primaryKey(),
  transferId: varchar('transfer_id', { length: 64 }).notNull().unique(),
  universalId: varchar('universal_id', { length: 64 }).notNull().references(() => customers.universalId),
  partnerId: varchar('partner_id', { length: 64 }).notNull(),
  externalCustomerId: varchar('external_customer_id', { length: 100 }).notNull(),
  points: integer('points').notNull(),
  transactionType: varchar('transaction_type', { length: 32 }).notNull(),
  purpose: varchar('purpose', { length: 64 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

export const pointsTransactionsRelations = relations(pointsTransactions, ({ one }) => ({
  customer: one(customers, {
    fields: [pointsTransactions.universalId],
    references: [customers.universalId]
  })
}));

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions)
  .omit({ id: true, createdAt: true });

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;