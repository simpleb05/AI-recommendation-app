const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  moodTag: { type: String },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  priceRange: { type: String },
  openingHours: { type: String },
  photoUrl: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Place", placeSchema);