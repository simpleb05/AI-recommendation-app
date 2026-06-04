const User = require("../models/User");
const Place = require("../models/Place");
const Feedback = require("../models/Feedback");

// AI 추천 (사용자 선호 + 피드백 기반)
const getRecommendations = async (req, res) => {
  try {
    // 사용자 선호 정보 조회
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });
    }

    const { activityType, moodTag, budgetRange } = user.preference;

    // 싫어요한 장소 제외
    const dislikedFeedbacks = await Feedback.find({ userId: req.userId, feedback: "dislike" });
    const dislikedPlaceIds = dislikedFeedbacks.map((f) => f.placeId);

    // 좋아요한 장소의 카테고리/분위기 추가 반영
    const likedFeedbacks = await Feedback.find({ userId: req.userId, feedback: "like" }).populate("placeId");
    const likedCategories = likedFeedbacks.map((f) => f.placeId?.category).filter(Boolean);
    const likedMoodTags = likedFeedbacks.map((f) => f.placeId?.moodTag).filter(Boolean);

    // 필터 조건 생성
    const filter = {
      _id: { $nin: dislikedPlaceIds }, // 싫어요 장소 제외
    };
    if (activityType || likedCategories.length > 0) {
      filter.category = { $in: [activityType, ...likedCategories].filter(Boolean) };
    }
    if (moodTag || likedMoodTags.length > 0) {
      filter.moodTag = { $in: [moodTag, ...likedMoodTags].filter(Boolean) };
    }
    if (budgetRange) filter.priceRange = budgetRange;

    let places = await Place.find(filter).limit(3);

    // 필터 결과가 없으면 싫어요 장소만 제외하고 랜덤 추천
    if (places.length === 0) {
      places = await Place.find({ _id: { $nin: dislikedPlaceIds } }).limit(3);
    }

    // 그래도 없으면 전체 랜덤
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