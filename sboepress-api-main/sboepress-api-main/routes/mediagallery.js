const express = require("express");
const router = express.Router();
const MediaGallery = require("../models/MediaGallery");
const authenticate = require("../middlewares/auth-middleware");

// 🔐 Apply authentication middleware
router.use(authenticate);

// 📌 Upload new media
router.post("/", async (req, res) => {
  try {
    const { event_id, file_type, file_url, uploaded_by, caption } = req.body;

    if (!event_id || !file_type || !file_url || !uploaded_by) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const media = await MediaGallery.create({
      event_id,
      file_type,
      file_url,
      uploaded_by,
      caption,
    });

    res.status(201).json({ success: true, message: "Media uploaded", data: media });
  } catch (err) {
    console.error("Error uploading media:", err.message);
    res.status(500).json({ success: false, message: "Media upload failed", error: err.message });
  }
});

// 📌 Get all media (optionally filter by event or user)
router.get("/", async (req, res) => {
  try {
    const { eventId, userId } = req.query;
    const query = {};
    if (eventId) query.event_id = eventId;
    if (userId) query.uploaded_by = userId;

    const media = await MediaGallery.find(query)
      .populate("event_id", "title date")
      .populate("uploaded_by", "full_name email");

    res.status(200).json({ success: true, data: media });
  } catch (err) {
    console.error("Error fetching media:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch media", error: err.message });
  }
});

// 📌 Get single media by ID
router.get("/:id", async (req, res) => {
  try {
    const media = await MediaGallery.findById(req.params.id)
      .populate("event_id", "title date")
      .populate("uploaded_by", "full_name email");

    if (!media) return res.status(404).json({ success: false, message: "Media not found" });
    res.status(200).json({ success: true, data: media });
  } catch (err) {
    console.error("Error fetching media by ID:", err.message);
    res.status(500).json({ success: false, message: "Error fetching media", error: err.message });
  }
});

// 📌 Delete media (organizer or admin only)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MediaGallery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Media not found" });
    res.json({ success: true, message: "Media deleted" });
  } catch (err) {
    console.error("Error deleting media:", err.message);
    res.status(500).json({ success: false, message: "Error deleting media", error: err.message });
  }
});

module.exports = router;
