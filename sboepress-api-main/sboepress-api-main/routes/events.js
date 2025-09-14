const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const authMiddleware = require("../middlewares/auth-middleware");

// Get all events with participants
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "full_name email")
      .populate("participants.user", "full_name email");

    const eventsWithParticipantCount = events.map(event => ({
      ...event.toObject(),
      participantCount: event.participants.length
    }));

    res.status(200).json({
      success: true,
      data: eventsWithParticipantCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single event with participants
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "full_name email")
      .populate("participants.user", "full_name email")
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const formattedEvent = {
      ...event,
      participantCount: event.participants?.length || 0,
      participants:
        event.participants?.map(p => ({
          id: p.user._id,
          name: p.user.full_name,
          email: p.user.email,
          status: p.status,
          registrationDate: p.registrationDate
        })) || []
    };

    res.status(200).json({
      success: true,
      data: formattedEvent
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Register for event
router.post("/:id/register", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const alreadyRegistered = event.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event"
      });
    }

    event.participants.push({
      user: req.user.id,
      status: "registered",
      registrationDate: new Date()
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: "Successfully registered for event"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.id
    });
    const savedEvent = await event.save();
    res.status(201).json({ success: true, data: savedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user is admin or the event organizer
    const isAdmin = userRole === "admin";
    const isOrganizer = userRole === "organizer";
    const isEventCreator = event.organizer.toString() === userId;

    if (!isAdmin && (!isOrganizer || !isEventCreator)) {
      console.log('Permission denied:', {
        userRole,
        isAdmin,
        isOrganizer,
        isEventCreator,
        userId,
        eventOrganizer: event.organizer.toString()
      });
      
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this event"
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "date",
      "location",
      "capacity",
      "price",
      "category",
      "image"
    ];

    const sanitizedUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { ...sanitizedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true, context: "query" }
    ).populate("organizer", "full_name email");

    res.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully"
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating event"
    });
  }
});

// Delete event (only once!)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
