import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

connectDB();

const app = express();

// CORS Configuration
app.use(
  cors({
    // If FRONTEND_URL is not set in Render environment, it will fallback to localhost to prevent CORS crashes
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// VERY IMPORTANT
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Health check endpoint (Useful for Render health checks)
app.get("/health", (req, res) => {
  res.status(200).send("Backend is healthy");
});

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"), (err) => {
      if (err) {
        // Prevent Express from crashing if the frontend dist is missing (e.g. separate frontend/backend deployments)
        res.status(404).send("API is running, but frontend build is not found.");
      }
    });
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 WebChat Backend Running");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});