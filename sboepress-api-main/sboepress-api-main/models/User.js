const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: false, default: "" }, 
  role: { type: String, default: "user" },
  department: { type: String, default: "" },
  enrollmentNumber: { type: String, default: "" },
  institutionalId: { type: String, default: "" }
});

module.exports = mongoose.model('User', userSchema);
