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
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [
    {
      text: { type: String },
      authorName: { type: String },
      rating: { type: Number },
      time: { type: String },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Place", placeSchema);