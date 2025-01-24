import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "better-sqlite",
  dbCredentials: {
    url: "sqlite.db"
  }
});