import {
  users,
  reports,
  type User,
  type InsertUser,
  type Report,
  type InsertReport
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Report methods
  getReport(id: number): Promise<Report | undefined>;
  getReportByCode(code: string): Promise<Report | undefined>;
  getReports(): Promise<Report[]>;
  getReportsByUser(reporterEmail: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: string, assignedTo?: string): Promise<Report | undefined>;
  updateReportCoordinates(id: number, latitude: string, longitude: string): Promise<Report | undefined>;
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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const id = uuidv4();

    const userData = {
      id,
      nama: insertUser.nama,
      email: insertUser.email,
      password: await bcrypt.hash(insertUser.password, 10),
      role: insertUser.role || "pelapor",
      status: insertUser.status || "aktif",
      avatar: insertUser.avatar || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(userData);
    const [newUser] = await db.select().from(users).where(eq(users.id, id));
    return newUser;
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

    const result = await db
      .insert(reports)
      .values({
        ...insertReport,
        code,
        status: insertReport.status || "pending",
        photos: Array.isArray(insertReport.photos) ? insertReport.photos : [insertReport.photos]
      });

    const newId = result[0].insertId;
    const [newReport] = await db.select().from(reports).where(eq(reports.id, newId));
    return newReport;
  }

  async updateReportStatus(id: number, status: string, assignedTo?: string): Promise<Report | undefined> {
    await db
      .update(reports)
      .set({ 
        status, 
        assignedTo,
        updatedAt: new Date()
      })
      .where(eq(reports.id, id));

    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async updateReportCoordinates(id: number, latitude: string, longitude: string): Promise<Report | undefined> {
    try {
      await db
        .update(reports)
        .set({ 
          latitude, 
          longitude,
          updatedAt: new Date()
        })
        .where(eq(reports.id, id));

      const [report] = await db.select().from(reports).where(eq(reports.id, id));
      return report || undefined;
    } catch (error) {
      console.error('Error updating report coordinates:', error);
      throw error;
    }
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

  // Method tambahan untuk mengelola koordinat
  async getReportsWithoutCoordinates(): Promise<Report[]> {
    try {
      const allReports = await db.select().from(reports);
      return allReports.filter(report => !report.latitude || !report.longitude);
    } catch (error) {
      console.error('Error getting reports without coordinates:', error);
      throw error;
    }
  }

  async getReportsInBounds(
    northEast: { lat: number; lng: number },
    southWest: { lat: number; lng: number }
  ): Promise<Report[]> {
    try {
      const allReports = await db.select().from(reports);
      
      return allReports.filter(report => {
        if (!report.latitude || !report.longitude) return false;
        
        const lat = parseFloat(report.latitude);
        const lng = parseFloat(report.longitude);
        
        return (
          lat >= southWest.lat &&
          lat <= northEast.lat &&
          lng >= southWest.lng &&
          lng <= northEast.lng
        );
      });
    } catch (error) {
      console.error('Error getting reports in bounds:', error);
      throw error;
    }
  }

  async getReportsByLocation(location: string): Promise<Report[]> {
    try {
      const allReports = await db.select().from(reports);
      return allReports.filter(report => 
        report.location.toLowerCase().includes(location.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting reports by location:', error);
      throw error;
    }
  }

  async getRecentReports(limit: number = 10): Promise<Report[]> {
    try {
      const allReports = await db.select().from(reports).orderBy(reports.createdAt);
      return allReports.slice(-limit).reverse(); // Get last N reports and reverse to get newest first
    } catch (error) {
      console.error('Error getting recent reports:', error);
      throw error;
    }
  }

  // Analytics methods
  async getReportsByDisasterType(): Promise<{ [key: string]: number }> {
    try {
      const allReports = await db.select().from(reports);
      const stats: { [key: string]: number } = {};
      
      allReports.forEach(report => {
        const type = report.disasterType.toLowerCase();
        stats[type] = (stats[type] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting reports by disaster type:', error);
      throw error;
    }
  }

  async getReportsTrend(days: number = 30): Promise<{ date: string; count: number }[]> {
    try {
      const allReports = await db.select().from(reports);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentReports = allReports.filter(report => 
        report.createdAt && new Date(report.createdAt) >= cutoffDate
      );
      
      const trendData: { [key: string]: number } = {};
      
      recentReports.forEach(report => {
        if (report.createdAt) {
          const date = new Date(report.createdAt).toISOString().split('T')[0];
          trendData[date] = (trendData[date] || 0) + 1;
        }
      });
      
      // Fill in missing dates with 0
      const result: { date: string; count: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: trendData[dateStr] || 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting reports trend:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize database with default admin user and sample data
async function initializeDatabase() {
  try {
    const existingAdmin = await storage.getUserByEmail("admindev@gmail.com");
    if (!existingAdmin) {
      await storage.createUser({
        nama: "Admin Dev",
        email: "admindev@gmail.com",
        password: "admin123",
        role: "admin",
        status: "aktif",
        avatar: "https://api.dicebear.com/8.x/lorelei/svg?seed=1",
      });
      console.log("Default admin user created");
    }

    // Check if we need to add sample data
    const existingReports = await storage.getReports();
    if (existingReports.length === 0) {
      console.log("Creating sample disaster reports...");
      
      const sampleReports = [
        {
          disasterType: "Banjir",
          location: "Jakarta Pusat",
          detailedAddress: "Jl. MH Thamrin No. 10",
          description: "Banjir setinggi 50cm akibat hujan deras sejak pagi. Beberapa kendaraan mogok dan akses jalan terganggu.",
          reporterName: "Ahmad Fauzi",
          reporterPhone: "081234567890",
          reporterEmail: "ahmad.fauzi@email.com",
          latitude: "-6.2088",
          longitude: "106.8456",
          status: "pending"
        },
        {
          disasterType: "Kebakaran",
          location: "Bandung, Jawa Barat",
          detailedAddress: "Jl. Asia Afrika No. 25",
          description: "Kebakaran di area pasar tradisional. Api sudah mulai dipadamkan oleh pemadam kebakaran.",
          reporterName: "Siti Nurhaliza",
          reporterPhone: "082345678901",
          reporterEmail: "siti.nur@email.com",
          latitude: "-6.9175",
          longitude: "107.6191",
          status: "validated"
        },
        {
          disasterType: "Longsor",
          location: "Bogor, Jawa Barat",
          detailedAddress: "Jl. Raya Puncak KM 15",
          description: "Longsor di tebing jalan raya akibat hujan berkepanjangan. Jalur lalu lintas terputus.",
          reporterName: "Budi Santoso",
          reporterPhone: "083456789012",
          reporterEmail: "budi.santoso@email.com",
          latitude: "-6.5971",
          longitude: "106.8060",
          status: "in_progress"
        },
        {
          disasterType: "Gempa",
          location: "Yogyakarta",
          detailedAddress: "Malioboro Street",
          description: "Gempa bumi berkekuatan 5.2 SR terasa selama 15 detik. Tidak ada kerusakan berarti.",
          reporterName: "Dewi Sartika",
          reporterPhone: "084567890123",
          reporterEmail: "dewi.sartika@email.com",
          latitude: "-7.7956",
          longitude: "110.3695",
          status: "resolved"
        },
        {
          disasterType: "Banjir",
          location: "Surabaya, Jawa Timur",
          detailedAddress: "Jl. Pemuda No. 50",
          description: "Genangan air di area perumahan akibat drainase yang tersumbat.",
          reporterName: "Rudi Hartono",
          reporterPhone: "085678901234",
          reporterEmail: "rudi.hartono@email.com",
          latitude: "-7.2575",
          longitude: "112.7521",
          status: "pending"
        }
      ];

      for (const report of sampleReports) {
        await storage.createReport(report);
      }
      
      console.log(`Created ${sampleReports.length} sample reports`);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeDatabase();