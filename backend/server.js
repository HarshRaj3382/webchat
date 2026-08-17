import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import { initializeSocket } from "./socket/socketServer.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

await connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: frontendOrigin, credentials: true },
});
app.set("io", io);

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/calls", callRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    features: {
      messaging: true,
      livekitCalls: Boolean(
        process.env.LIVEKIT_URL &&
        process.env.LIVEKIT_API_KEY &&
        process.env.LIVEKIT_API_SECRET
      ),
    },
  });
});

initializeSocket(io);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"), (error) => {
      if (error) res.status(404).send("API is running, but the frontend build was not found.");
    });
  });
} else {
  app.get("/", (req, res) => {
    res.send("WebChat backend is running");
  });
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`WebChat server running on http://localhost:${PORT}`);
});
