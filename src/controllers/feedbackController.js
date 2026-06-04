const Feedback = require("../models/Feedback");
const Place = require("../models/Place");

// 피드백 저장
const addFeedback = async (req, res) => {
  try {
    const { placeId, feedback } = req.body;

    // 이미 피드백한 장소인지 확인
    const existing = await Feedback.findOne({ userId: req.userId, placeId });
    if (existing) {
      // 이미 있으면 업데이트
      existing.feedback = feedback;
      await existing.save();
      return res.json({ success: true, message: "피드백 업데이트 완료" });
    }

    await Feedback.create({ userId: req.userId, placeId, feedback });
    res.status(201).json({ success: true, message: "피드백 저장 완료" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 피드백 목록 조회
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.userId }).populate("placeId");
    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addFeedback, getFeedbacks };