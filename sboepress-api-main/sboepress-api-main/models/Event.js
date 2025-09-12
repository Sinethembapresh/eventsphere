const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["technical", "cultural", "sports", "workshop", "other", "Culture"], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },

    // Organizer reference
    organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    maxParticipants: { type: Number, default: 100 },
    seatsBooked: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
