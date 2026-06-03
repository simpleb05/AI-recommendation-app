const express = require("express");
const router = express.Router();
const { getPlaces, getPlaceById, searchPlaces } = require("../controllers/placeController");

router.get("/", getPlaces);
router.get("/search", searchPlaces);
router.get("/:id", getPlaceById);

module.exports = router;