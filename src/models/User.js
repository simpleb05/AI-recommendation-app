const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  preference: {
    activityType: { type: String, default: "" },
    moodTag: { type: String, default: "" },
    budgetRange: { type: String, default: "" },
    groupSize: { type: String, default: "" },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);