import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  billNo: text("bill_no").notNull(),
  date: text("date").notNull(),
  customer: text("customer").notNull(),
  phone: text("phone"),
  note: text("note"),
  paymentMethod: text("payment_method").notNull().default("Cash"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const saleItemsTable = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => salesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  size: text("size").notNull().default("-"),
  qty: integer("qty").notNull().default(1),
  rate: numeric("rate", { precision: 12, scale: 2 }).notNull().default("0"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof salesTable.$inferSelect;

export const insertSaleItemSchema = createInsertSchema(saleItemsTable).omit({
  id: true,
});
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItemsTable.$inferSelect;
