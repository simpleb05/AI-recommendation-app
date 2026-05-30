const User = require("../models/User");
const Place = require("../models/Place");

// AI 추천 (사용자 선호 기반)
const getRecommendations = async (req, res) => {
  try {
    // 사용자 선호 정보 조회
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }

    const { activityType, moodTag, budgetRange } = user.preference;

    // 선호 정보 기반 장소 필터링
    const filter = {};
    if (activityType) filter.category = activityType;
    if (moodTag) filter.moodTag = moodTag;
    if (budgetRange) filter.priceRange = budgetRange;

    let places = await Place.find(filter).limit(3);

    // 필터 결과가 없으면 전체에서 3개 랜덤 추천
    if (places.length === 0) {
      places = await Place.aggregate([{ $sample: { size: 3 } }]);
    }

    // 추천 이유 생성
    const recommendations = places.map((place) => ({
      place,
      reason: `회원님의 선호 활동(${activityType || "다양한 활동"})과 분위기(${moodTag || "다양한 분위기"})를 반영한 추천입니다.`,
    }));

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendations };