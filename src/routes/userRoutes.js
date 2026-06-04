const express = require("express");
const router = express.Router();
const { getPreference, updatePreference, getProfile, updateNickname, updatePassword } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/preference", authMiddleware, getPreference);
router.put("/preference", authMiddleware, updatePreference);
router.get("/profile", authMiddleware, getProfile);
router.put("/nickname", authMiddleware, updateNickname);
router.put("/password", authMiddleware, updatePassword);

module.exports = router;