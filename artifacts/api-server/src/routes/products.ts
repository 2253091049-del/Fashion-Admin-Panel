import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";

const router: IRouter = Router();

function serialize(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    price: parseFloat(String(p.price)),
    createdAt: String(p.createdAt),
  };
}

function parseBody(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const category = typeof body.category === "string" ? body.category : "General";
  const size = typeof body.size === "string" ? body.size : "-";
  const price = typeof body.price === "number" ? body.price : parseFloat(String(body.price)) || 0;
  const stock = typeof body.stock === "number" ? Math.round(body.stock) : parseInt(String(body.stock)) || 0;
  if (!name) return null;
  return { name, category, size, price, stock };
}

router.get("/products", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(productsTable.createdAt);
  res.json(products.map(serialize));
});

router.post("/products", async (req, res): Promise<void> => {
  const data = parseBody(req.body as Record<string, unknown>);
  if (!data) { res.status(400).json({ error: "name is required" }); return; }

  const [product] = await db
    .insert(productsTable)
    .values(data)
    .returning();
  res.status(201).json(serialize(product));
});

router.put("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const data = parseBody(req.body as Record<string, unknown>);
  if (!data) { res.status(400).json({ error: "name is required" }); return; }

  const [product] = await db
    .update(productsTable)
    .set(data)
    .where(eq(productsTable.id, id))
    .returning();

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(serialize(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (!id || isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, id))
    .returning();

  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

export default router;
