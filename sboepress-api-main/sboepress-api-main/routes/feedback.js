const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// 📌 GET all feedback (optionally filter by event or student)
router.get("/", async (req, res) => {
  try {
    const { eventId, studentId } = req.query;
    const query = {};
    if (eventId) query.event_id = eventId;
    if (studentId) query.student_id = studentId;

    const feedback = await Feedback.find(query)
      .populate("event_id", "title date")
      .populate("student_id", "full_name email");

    res.json({ feedback });
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// 📌 GET single feedback by ID
router.get("/:id", async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id)
      .populate("event_id", "title date")
      .populate("student_id", "full_name email");

    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json({ feedback: fb });
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    res.status(500).json({ message: "Error fetching feedback", error: err.message });
  }
});

// 📌 CREATE feedback (students only)
router.post("/", async (req, res) => {
  try {
    const { event_id, student_id, rating, comments } = req.body;

    const newFeedback = new Feedback({
      event_id,
      student_id,
      rating,
      comments,
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted", feedback: newFeedback });
  } catch (err) {
    console.error("Error creating feedback:", err.message);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

module.exports = router;
