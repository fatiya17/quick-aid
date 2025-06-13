import { users, reports, type User, type InsertUser, type Report, type InsertReport } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reports: Map<number, Report>;
  private currentUserId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.reports = new Map();
    this.currentUserId = 1;
    this.currentReportId = 1;
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "Ahmad Saputra"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportByCode(code: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(
      (report) => report.code === code,
    );
  }

  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getReportsByUser(reporterEmail: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.reporterEmail === reporterEmail)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const code = `QA-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const now = new Date();
    
    const report: Report = { 
      ...insertReport, 
      id, 
      code, 
      createdAt: now, 
      updatedAt: now 
    };
    
    this.reports.set(id, report);
    return report;
  }

  async updateReportStatus(id: number, status: string, assignedTo?: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport: Report = {
      ...report,
      status,
      assignedTo: assignedTo || report.assignedTo,
      updatedAt: new Date()
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async getReportsByStatus(status: string): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.status === status)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getReportStats(): Promise<{
    total: number;
    pending: number;
    validated: number;
    inProgress: number;
    resolved: number;
  }> {
    const allReports = Array.from(this.reports.values());
    
    return {
      total: allReports.length,
      pending: allReports.filter(r => r.status === "pending").length,
      validated: allReports.filter(r => r.status === "validated").length,
      inProgress: allReports.filter(r => r.status === "in_progress").length,
      resolved: allReports.filter(r => r.status === "resolved").length,
    };
  }
}

export const storage = new MemStorage();
