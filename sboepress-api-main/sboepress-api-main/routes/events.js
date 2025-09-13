const express = require("express");
const router = express.Router();
const Event = require("../models/Event"); 
const authenticate = require("../middlewares/auth-middleware");

router.use(authenticate);

// 📌 GET all events (newest first)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).populate("organizer_id", "full_name email");
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// 📌 CREATE a new event
router.post("/create", async (req, res) => {
  const { title, description, category, date, time, venue, maxParticipants } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      category,
      date,
      time,
      venue,
      organizer_id: req.user._id, // Set from authenticated user
      maxParticipants,
      status: "pending", // default until admin approves
    });

    await newEvent.save();

    res.status(201).json({ message: "Event created successfully", eventId: newEvent._id });
  } catch (err) {
    console.error("Error creating event:", err.message);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// 📌 GET single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer_id", "full_name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err.message);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event updated successfully", event: updated });
  } catch (err) {
    console.error("Error updating event:", err.message);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// 📌 DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
