import { Router, type IRouter } from "express";
import { db, productsTable, salesTable, saleItemsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/backup", async (_req, res): Promise<void> => {
  const [products, sales, saleItems] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(salesTable),
    db.select().from(saleItemsTable),
  ]);

  res.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    products,
    sales,
    saleItems,
  });
});

router.post("/backup/restore", async (req, res): Promise<void> => {
  const payload = req.body as {
    products?: Array<typeof productsTable.$inferInsert>;
    sales?: Array<typeof salesTable.$inferInsert>;
    saleItems?: Array<typeof saleItemsTable.$inferInsert>;
  };

  const products = Array.isArray(payload?.products) ? payload.products : [];
  const sales = Array.isArray(payload?.sales) ? payload.sales : [];
  const saleItems = Array.isArray(payload?.saleItems) ? payload.saleItems : [];

  try {
    db.transaction((tx) => {
      tx.run(sql`DELETE FROM sale_items`);
      tx.run(sql`DELETE FROM sales`);
      tx.run(sql`DELETE FROM products`);

      if (products.length > 0) {
        tx.insert(productsTable).values(products).run();
      }

      if (sales.length > 0) {
        tx.insert(salesTable).values(sales).run();
      }

      if (saleItems.length > 0) {
        tx.insert(saleItemsTable).values(saleItems).run();
      }
    });

    res.json({ ok: true, counts: { products: products.length, sales: sales.length, saleItems: saleItems.length } });
  } catch (error) {
    req.log.error({ err: error }, "Failed to restore backup");
    res.status(400).json({ ok: false, error: "Failed to restore backup payload" });
  }
});

export default router;
