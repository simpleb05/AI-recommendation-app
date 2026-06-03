const User = require("../models/User");

// 선호 설정 조회
const getPreference = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
    res.json({ success: true, preference: user.preference });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 선호 설정 저장/수정
const updatePreference = async (req, res) => {
  try {
    const { activityType, moodTag, budgetRange, groupSize } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { preference: { activityType, moodTag, budgetRange, groupSize } },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "선호 설정 저장 완료", preference: user.preference });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPreference, updatePreference };