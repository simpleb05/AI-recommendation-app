const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
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

    // Google Places 정보
    googlePlaceId: { type: String, unique: true, sparse: true },
    rating: { type: Number, default: 0 },
    userRatingsTotal: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    types: [{ type: String }],

    reviews: [
      {
        text: { type: String },
        authorName: { type: String },
        rating: { type: Number },
        time: { type: String },
      },
    ],

    // 추천 엔진 결과
    isOpen: { type: Boolean },
    hashtags: [{ type: String }],
    score: { type: Number },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);