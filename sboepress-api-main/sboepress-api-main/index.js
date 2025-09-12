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
const jwt = require("jsonwebtoken");

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
const studentRoutes = require('./routes/student-routes/index.js');

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

// Auth Routes - Move this BEFORE protected routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set proper redirect URL based on role
    const redirectUrl = user.role === 'student' 
      ? '/student/dashboard'
      : user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/';

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.full_name
        },
        redirectUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Protected Routes - Add studentRoutes
app.use('/api/student', authMiddleware, roleCheck(['student']), studentRoutes);
app.use('/api/admin', authMiddleware, roleCheck(['admin']), adminRoutes);
app.use('/api/events', authMiddleware, eventRoutes);

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

// Test route to verify auth
app.get('/api/auth-test', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    }
  });
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
// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});
