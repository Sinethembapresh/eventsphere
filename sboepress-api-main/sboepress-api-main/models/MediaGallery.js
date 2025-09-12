const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    file_type: { type: String, enum: ["image", "video"], required: true },
    file_url: { type: String, required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    caption: { type: String },
    uploaded_on: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaGallery", mediaSchema);
