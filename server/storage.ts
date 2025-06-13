import { users, reports, type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Report methods
  getReport(id: number): Promise<Report | undefined>;
  getReportByCode(code: string): Promise<Report | undefined>;
  getReports(): Promise<Report[]>;
  getReportsByUser(reporterEmail: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: string, assignedTo?: string): Promise<Report | undefined>;
  getReportsByStatus(status: string): Promise<Report[]>;
  
  // Statistics
  getReportStats(): Promise<{
    total: number;
    pending: number;
    validated: number;
    inProgress: number;
    resolved: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getReportByCode(code: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.code, code));
    return report || undefined;
  }

  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(reports.createdAt);
  }

  async getReportsByUser(reporterEmail: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.reporterEmail, reporterEmail));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const code = `QA-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    const [report] = await db
      .insert(reports)
      .values({
        ...insertReport,
        code,
        status: insertReport.status || "pending"
      })
      .returning();
    return report;
  }

  async updateReportStatus(id: number, status: string, assignedTo?: string): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ status, assignedTo })
      .where(eq(reports.id, id))
      .returning();
    return report || undefined;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.status, status));
  }

  async getReportStats(): Promise<{
    total: number;
    pending: number;
    validated: number;
    inProgress: number;
    resolved: number;
  }> {
    const allReports = await db.select().from(reports);
    
    return {
      total: allReports.length,
      pending: allReports.filter(r => r.status === "pending").length,
      validated: allReports.filter(r => r.status === "validated").length,
      inProgress: allReports.filter(r => r.status === "in_progress").length,
      resolved: allReports.filter(r => r.status === "resolved").length,
    };
  }
}

export const storage = new DatabaseStorage();

// Initialize database with default admin user
async function initializeDatabase() {
  try {
    // Check if admin user exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Ahmad Saputra"
      });
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize on startup
initializeDatabase();
