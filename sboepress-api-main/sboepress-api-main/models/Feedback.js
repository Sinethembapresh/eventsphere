const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    submitted_on: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
