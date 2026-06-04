const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
  feedback: { type: String, enum: ["like", "dislike"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);