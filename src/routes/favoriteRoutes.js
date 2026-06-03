const express = require("express");
const router = express.Router();
const { addFavorite, getFavorites, deleteFavorite } = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addFavorite);
router.get("/", authMiddleware, getFavorites);
router.delete("/:placeId", authMiddleware, deleteFavorite);

module.exports = router;