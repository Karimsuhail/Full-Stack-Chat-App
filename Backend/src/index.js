import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

// ✅ Middlewares

console.log("Registering middleware: express.json");
app.use(express.json({ limit: "50mb" }));
console.log("Registering middleware: express.urlencoded");
app.use(express.urlencoded({ limit: "50mb", extended: true }));
console.log("Registering middleware: cookieParser");
app.use(cookieParser());
console.log("Registering middleware: cors");
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Routes

console.log("Registering route: /api/auth", typeof authRoutes);
app.use("/api/auth", authRoutes);
console.log("Registering route: /api/messages", typeof messageRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend build (Render uses production)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  console.log("Registering static middleware for frontend build at:", frontendPath);
  app.use(express.static(frontendPath));

  // ✅ Correct fallback route — fixes your current crash
  console.log("Registering fallback route: *");
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Health check (for Render)
app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

// ✅ Start server
server.listen(PORT, async () => {
  console.log(`✅ Server running on port: ${PORT}`);
  await connectDB();
});
