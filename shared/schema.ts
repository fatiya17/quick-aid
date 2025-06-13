import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  name: text("name"),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  disasterType: text("disaster_type").notNull(),
  location: text("location").notNull(),
  detailedAddress: text("detailed_address"),
  description: text("description").notNull(),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  reporterEmail: text("reporter_email"),
  photos: text("photos").array(), // Array of photo URLs
  status: text("status").notNull().default("pending"), // "pending", "validated", "in_progress", "resolved"
  latitude: text("latitude"),
  longitude: text("longitude"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  code: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const reportFormSchema = insertReportSchema.extend({
  disasterType: z.string().min(1, "Jenis bencana harus dipilih"),
  location: z.string().min(1, "Lokasi harus diisi"),
  detailedAddress: z.string().optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  photos: z.array(z.string()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type ReportFormData = z.infer<typeof reportFormSchema>;
