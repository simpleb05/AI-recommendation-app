const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 회원가입
const register = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "이미 사용중인 이메일입니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname,
    });

    res.status(201).json({ success: true, message: "회원가입 성공" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 로그인
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유저 확인
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    // 토큰 생성
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, nickname: user.nickname });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };