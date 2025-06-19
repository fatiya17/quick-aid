import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  reportFormSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { BlobServiceClient } from "@azure/storage-blob";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

// Konfigurasi Multer untuk menyimpan file di memori sementara
const upload = multer({ storage: multer.memoryStorage() });

// Geocoding function untuk mendapatkan koordinat dari alamat
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Menggunakan OpenStreetMap Nominatim API (gratis)
    const encodedLocation = encodeURIComponent(`${location}, Indonesia`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1&countrycodes=id`
    );
    
    if (!response.ok) {
      console.warn('Geocoding request failed:', response.status);
      return null;
    }
    
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Fungsi helper untuk mendapatkan koordinat default berdasarkan kota
function getDefaultCoordinates(location: string): { lat: number; lng: number } {
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'bandung': { lat: -6.9175, lng: 107.6191 },
    'surabaya': { lat: -7.2575, lng: 112.7521 },
    'yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'medan': { lat: 3.5952, lng: 98.6722 },
    'makassar': { lat: -5.1477, lng: 119.4327 },
    'palembang': { lat: -2.9761, lng: 104.7754 },
    'semarang': { lat: -6.9667, lng: 110.4167 },
    'denpasar': { lat: -8.6500, lng: 115.2167 },
    'pontianak': { lat: -0.0263, lng: 109.3425 },
    'balikpapan': { lat: -1.2379, lng: 116.8294 },
    'manado': { lat: 1.4748, lng: 124.8421 },
    'pekanbaru': { lat: 0.5071, lng: 101.4478 },
    'banjarmasin': { lat: -3.3194, lng: 114.5906 },
    'padang': { lat: -0.9471, lng: 100.4172 }
  };

  const locationKey = location.toLowerCase();
  
  // Check if location contains any of the mapped cities
  for (const [city, coords] of Object.entries(locationMap)) {
    if (locationKey.includes(city)) {
      return coords;
    }
  }

  // Default to Jakarta if no match found
  return { lat: -6.2088, lng: 106.8456 };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ---------- AUTH ----------
  app.post("/api/register", async (req, res) => {
    try {
      console.log("DATA YANG DITERIMA REGISTER:", req.body);
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const user = await storage.createUser(userData);

      res.status(201).json({
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Data registrasi tidak valid" });
    }
  });

app.post("/api/login", async (req, res) => {
  try {
    console.log("DEBUG: Login request body:", req.body);
    const { email, password } = loginSchema.parse(req.body);
    console.log("DEBUG: Parsed email:", email);

    const user = await storage.getUserByEmail(email);
    console.log("DEBUG: User fetched from DB:", user ? user.email : "Not found");
    if (!user) {
      console.log("LOGIN FAILED: User not found for email:", email);
      return res.status(401).json({ message: "Email atau password salah" });
    }
    console.log("DEBUG: Stored user password hash:", user.password);
    console.log("DEBUG: Input password (plain):", password);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log("DEBUG: bcrypt.compare result:", isPasswordMatch);

    if (!isPasswordMatch) {
      console.log("LOGIN FAILED: Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // ----- LOGIK ANDA HARUS MELALUI TITIK INI DAN MEMBERIKAN LOG BERIKUT -----
    console.log("DEBUG: Login successful, NO STATUS CHECK FAILURE. User status:", user.status); // Tambahkan log ini
    console.log("DEBUG: Sending 200 OK response for user:", user.email);
    res.json({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar
      }
    });
    console.log("DEBUG: Response sent successfully.");

  } catch (error) {
    console.error("DEBUG: GLOBAL LOGIN CATCH ERROR:", error);
    // ... (rest of your error handling)
  }
});

  // ---------- REPORT ----------
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = reportFormSchema.parse(req.body);
      
      // Coba dapatkan koordinat dari geocoding jika belum ada
      let coordinates = null;
      if (!reportData.latitude || !reportData.longitude) {
        console.log('Attempting to geocode location:', reportData.location);
        coordinates = await geocodeLocation(reportData.location);
        
        if (coordinates) {
          reportData.latitude = coordinates.lat.toString();
          reportData.longitude = coordinates.lng.toString();
          console.log('Geocoding successful:', coordinates);
        } else {
          // Gunakan koordinat default jika geocoding gagal
          const defaultCoords = getDefaultCoordinates(reportData.location);
          reportData.latitude = defaultCoords.lat.toString();
          reportData.longitude = defaultCoords.lng.toString();
          console.log('Using default coordinates:', defaultCoords);
        }
      }
      
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error('Create report error:', error);
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
      console.error('Get reports error:', error);
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

      const validStatus = ["pending", "validated", "in_progress", "resolved"];
      if (!validStatus.includes(status)) {
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

  // Endpoint baru untuk update koordinat laporan
  app.patch("/api/reports/:id/coordinates", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude, location } = req.body;

      let lat = latitude;
      let lng = longitude;

      // Jika koordinat tidak disediakan, coba geocoding
      if (!lat || !lng) {
        if (!location) {
          return res.status(400).json({ message: "Location is required for geocoding" });
        }
        
        const coordinates = await geocodeLocation(location);
        if (coordinates) {
          lat = coordinates.lat;
          lng = coordinates.lng;
        } else {
          const defaultCoords = getDefaultCoordinates(location);
          lat = defaultCoords.lat;
          lng = defaultCoords.lng;
        }
      }

      const report = await storage.updateReportCoordinates(id, lat.toString(), lng.toString());

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error('Update coordinates error:', error);
      res.status(500).json({ message: "Failed to update coordinates" });
    }
  });

  // Endpoint untuk geocoding manual
  app.post("/api/geocode", async (req, res) => {
    try {
      const { location } = req.body;
      
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }

      const coordinates = await geocodeLocation(location);
      
      if (coordinates) {
        res.json(coordinates);
      } else {
        // Return default coordinates if geocoding fails
        const defaultCoords = getDefaultCoordinates(location);
        res.json({
          ...defaultCoords,
          isDefault: true,
          message: "Using default coordinates for this location"
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ message: "Geocoding failed" });
    }
  });

  // Batch update coordinates untuk laporan yang sudah ada
  app.post("/api/reports/batch-geocode", async (req, res) => {
    try {
      const reports = await storage.getReports();
      const updates = [];
      let successCount = 0;
      let failCount = 0;

      for (const report of reports) {
        // Skip jika sudah ada koordinat
        if (report.latitude && report.longitude) {
          continue;
        }

        console.log(`Geocoding report ${report.id}: ${report.location}`);
        
        // Delay untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const coordinates = await geocodeLocation(report.location);
        
        if (coordinates) {
          await storage.updateReportCoordinates(
            report.id, 
            coordinates.lat.toString(), 
            coordinates.lng.toString()
          );
          updates.push({
            id: report.id,
            location: report.location,
            coordinates,
            status: 'success'
          });
          successCount++;
        } else {
          // Gunakan koordinat default
          const defaultCoords = getDefaultCoordinates(report.location);
          await storage.updateReportCoordinates(
            report.id,
            defaultCoords.lat.toString(),
            defaultCoords.lng.toString()
          );
          updates.push({
            id: report.id,
            location: report.location,
            coordinates: defaultCoords,
            status: 'default'
          });
          failCount++;
        }
      }

      res.json({
        message: "Batch geocoding completed",
        totalProcessed: updates.length,
        successCount,
        failCount,
        updates
      });
    } catch (error) {
      console.error('Batch geocode error:', error);
      res.status(500).json({ message: "Batch geocoding failed" });
    }
  });

  // ---------- STATISTICS ----------
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getReportStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ---------- UPLOAD FOTO ----------
  app.post("/api/reports/upload", upload.single("photo"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah." });
    }

    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connectionString) {
        throw new Error("Azure Storage connection string tidak ditemukan.");
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient("report-photos");

      const blobName = `${nanoid()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype }
      });

      res.json({ url: blockBlobClient.url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Gagal mengunggah file." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}