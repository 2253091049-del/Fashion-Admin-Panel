import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salesTable = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  billNo: text("bill_no").notNull(),
  date: text("date").notNull(),
  customer: text("customer").notNull(),
  phone: text("phone"),
  note: text("note"),
  paymentMethod: text("payment_method").notNull().default("Cash"),
  total: real("total").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const saleItemsTable = sqliteTable("sale_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id")
    .notNull()
    .references(() => salesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  size: text("size").notNull().default("-"),
  qty: integer("qty").notNull().default(1),
  rate: real("rate").notNull().default(0),
  amount: real("amount").notNull().default(0),
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
