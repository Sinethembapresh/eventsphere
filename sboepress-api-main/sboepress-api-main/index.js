// Firebase-compatible Express app for MoMo Collection + EventSphere
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Configure dotenv with the correct path
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  debug: true,
});

// Add debug logging
console.log("Environment variables loaded:", {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
});

const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Models (EventSphere)
const User = require("./models/User.js");
const Event = require("./models/Event.js");
const Feedback = require("./models/Feedback.js");
const Media = require("./models/MediaGallery.js");

// MoMo Collection Routes

// Auth & Admin Routes
const authRoutes = require("./routes/auth-routes/index.js");
const adminRoutes = require("./routes/admin-routes/admin.js");
const eventRoutes = require("./routes/events.js"); // Add this line

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: ["https://eventsphere.pages.dev", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(morgan("common"));

// Rate limiting (apply globally if you want)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Slow down Great one, You too fast mate!",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => console.error("❌ MongoDB error:", e));

// MoMo Collection Routes
// Create API user

// Auth and Admin Routes
app.use("/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes); // Add this line

// Example: get user by ID
app.get("/api/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("email full_name role");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});
