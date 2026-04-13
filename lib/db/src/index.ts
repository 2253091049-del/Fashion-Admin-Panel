import path from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function resolveDbFilePath() {
  if (process.env.SQLITE_DB_PATH) {
    return path.resolve(process.env.SQLITE_DB_PATH);
  }

  return path.resolve(process.cwd(), "data", "fashion-admin.sqlite");
}

export const sqliteFilePath = resolveDbFilePath();
mkdirSync(path.dirname(sqliteFilePath), { recursive: true });

const sqlite = new Database(sqliteFilePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  size TEXT NOT NULL DEFAULT '-',
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_no TEXT NOT NULL,
  date TEXT NOT NULL,
  customer TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  total REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '-',
  qty INTEGER NOT NULL DEFAULT 1,
  rate REAL NOT NULL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);
`);

export const db = drizzle(sqlite, { schema });

export * from "./schema";
