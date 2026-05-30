const express = require("express");
const router = express.Router();
const { getPreference, updatePreference } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/preference", authMiddleware, getPreference);
router.put("/preference", authMiddleware, updatePreference);

module.exports = router;