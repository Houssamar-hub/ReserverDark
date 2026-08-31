import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Rate limiting - raised limit for developer and testing ease
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many requests from this IP, please try again later.",
});

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com"
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize request parameters — rebuild req.query as a plain writable object
// to avoid "Cannot set property query — has only a getter" in Express 4.x
app.use((req, res, next) => {
  // Sanitize query parameters by creating a fresh sanitized copy
  const rawQuery = req.query;
  if (rawQuery && typeof rawQuery === "object") {
    const sanitizedQuery = {};
    Object.keys(rawQuery).forEach((key) => {
      sanitizedQuery[key] =
        typeof rawQuery[key] === "string"
          ? rawQuery[key].replace(/[{}()\[\]$.]/g, "")
          : rawQuery[key];
    });
    // Override the read-only getter with our sanitized writable value
    Object.defineProperty(req, "query", {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
    });
  }

  // Sanitize body parameters in-place (body is a plain object, so safe to mutate)
  if (req.body) {
    const sanitizeObj = (obj) => {
      if (!obj || typeof obj !== "object") return;
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/[{}()\[\]$.]/g, "");
        } else if (typeof obj[key] === "object") {
          sanitizeObj(obj[key]);
        }
      });
    };
    sanitizeObj(req.body);
  }

  next();
});

// Rate limiting
app.use("/api", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
