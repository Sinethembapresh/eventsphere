const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Event = require("../../models/Event");
const Feedback = require("../../models/Feedback");
const Media = require("../../models/MediaGallery");
const authenticate = require("../../middlewares/auth-middleware");

// ✅ Require admin authentication for all routes
router.use(authenticate);

// Middleware: check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
}

// 🧑‍🤝‍🧑 Fetch all users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 🎭 Fetch all events (with status filter: pending/approved)
router.get("/events", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query; // ?status=pending
    const filter = status ? { status } : {};
    const events = await Event.find(filter).populate("organizer_id", "full_name email");
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ✅ Approve or reject an event
router.put("/events/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { action } = req.body; // action: "approve" | "reject"
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { status: action === "approve" ? "approved" : "rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json({ message: `Event ${action}d successfully`, event: updated });
  } catch (err) {
    res.status(500).json({ error: "Error updating event status" });
  }
});

// 🔧 Manage users: assign role (e.g., promote student → organizer)
router.put("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const { role } = req.body; // "participant" | "organizer" | "admin"
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User role updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Error updating user role" });
  }
});

// 📝 Fetch all feedback
router.get("/feedback", requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "full_name email")
      .sort({ createdAt: -1 });
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// 📝 Moderate feedback (delete)
router.delete("/feedback/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback removed" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting feedback" });
  }
});

// 🖼️ Fetch all media
router.get("/media", requireAdmin, async (req, res) => {
  try {
    const media = await Media.find()
      .populate("uploadedBy", "full_name email")
      .sort({ createdAt: -1 });
    res.json({ media });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// 🖼️ Moderate media (delete)
router.delete("/media/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Media.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Media not found" });
    res.json({ message: "Media deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting media" });
  }
});

module.exports = router;
