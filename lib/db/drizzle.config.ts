import { defineConfig } from "drizzle-kit";
import path from "path";

const sqlitePath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.resolve(process.cwd(), "data", "fashion-admin.sqlite");

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: sqlitePath,
  },
});
