import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  // highlight-start
  dialect: "mysql", // Mengganti 'postgresql' menjadi 'mysql'
  dbCredentials: {
    // Kredensial sekarang menggunakan format URL standar MySQL
    // Contoh: mysql://user:password@hostname:port/database
    url: process.env.DATABASE_URL,
  },
  // highlight-end
});