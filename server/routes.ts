import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, reportFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, you'd use proper session management
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          name: user.name 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Report routes
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = reportFormSchema.parse(req.body);
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const { status, email } = req.query;
      
      let reports;
      if (status) {
        reports = await storage.getReportsByStatus(status as string);
      } else if (email) {
        reports = await storage.getReportsByUser(email as string);
      } else {
        reports = await storage.getReports();
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.get("/api/reports/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const report = await storage.getReportByCode(code);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.patch("/api/reports/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, assignedTo } = req.body;
      
      if (!["pending", "validated", "in_progress", "resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const report = await storage.updateReportStatus(id, status, assignedTo);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to update report status" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getReportStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
