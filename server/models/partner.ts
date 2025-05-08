import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customers } from './customer';

/**
 * Partner business that integrates with Gami
 */
export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  partnerId: varchar('partner_id', { length: 64 }).notNull().unique(),
  partnerName: varchar('partner_name', { length: 100 }).notNull(),
  partnerApiKey: varchar('partner_api_key', { length: 64 }).notNull(),
  deepLinkUrl: text('deep_link_url'),
  redirectUrl: text('redirect_url'),
  oauthCallbackUrl: text('oauth_callback_url'),
  customCssUrl: text('custom_css_url'),
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 20 }),
  secondaryColor: varchar('secondary_color', { length: 20 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const partnersRelations = relations(partners, ({ many }) => ({
  customers: many(customers)
}));

export const insertPartnerSchema = createInsertSchema(partners)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;