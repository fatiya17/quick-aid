// Impor dari mysql-core, bukan pg-core
import { mysqlTable, text, varchar, int, char, timestamp, json, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Ganti pgTable menjadi mysqlTable
export const users = mysqlTable("users", {
  id: char("id", { length: 36 }).primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["pelapor", "petugas", "admin"]).default("pelapor").notNull(),
  status: mysqlEnum("status", ["aktif", "nonaktif", "menunggu_verifikasi"]).default("aktif"),
  createdAt: timestamp("createdAt").notNull(),             // <— CamelCase!
  updatedAt: timestamp("updatedAt").notNull(), 
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  avatar: varchar("avatar", { length: 255 }),
});

// Ganti pgTable menjadi mysqlTable
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  code: text("code").notNull(),
  disasterType: text("disaster_type").notNull(),
  location: text("location").notNull(),
  detailedAddress: text("detailed_address"),
  description: text("description").notNull(),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  reporterEmail: text("reporter_email"),
  // MySQL tidak punya tipe array, jadi kita gunakan JSON
  photos: json("photos"), // Sebelumnya: text("photos").array()
  status: text("status").notNull().default("pending"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bagian Zod schema tidak perlu diubah
export const insertUserSchema = z.object({
  nama: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["pelapor", "petugas", "admin"]).optional(),
  status: z.enum(["aktif", "nonaktif", "aktif"]).optional(),
  avatar: z.string().url().optional(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  code: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(6, "Password is required"),
});

export const reportFormSchema = insertReportSchema.extend({
  disasterType: z.string().min(1, "Jenis bencana harus dipilih"),
  location: z.string().min(1, "Lokasi harus diisi"),
  detailedAddress: z.string().optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  // Zod schema untuk validasi frontend tetap bisa menggunakan array
  photos: z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((val) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  }),

});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type ReportFormData = z.infer<typeof reportFormSchema>;