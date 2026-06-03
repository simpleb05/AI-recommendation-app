const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Favorite", favoriteSchema);