const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

// 프로필 조회
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 닉네임 변경
const updateNickname = async (req, res) => {
  try {
    const { nickname } = req.body;
    if (!nickname) {
      return res.status(400).json({ success: false, message: "닉네임을 입력해 주세요." });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { nickname },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "닉네임 변경 완료", nickname: user.nickname });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 비밀번호 변경
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "현재 비밀번호와 새 비밀번호를 입력해 주세요." });
    }

    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "현재 비밀번호가 틀렸습니다." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.userId, { password: hashedPassword });

    res.json({ success: true, message: "비밀번호 변경 완료" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPreference, updatePreference, getProfile, updateNickname, updatePassword };