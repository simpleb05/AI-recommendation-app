const express = require("express");
const router = express.Router();
const { addFeedback, getFeedbacks } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addFeedback);
router.get("/", authMiddleware, getFeedbacks);

module.exports = router;