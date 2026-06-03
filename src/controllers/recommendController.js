const User = require("../models/User");
const Place = require("../models/Place");

const { fetchPlacesByKeyword } = require("../../recommendation/placeApi");
const { recommendPlaces } = require("../../recommendation/recommendEngine");

// AI 추천 (사용자 선호 기반)
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "유저를 찾을 수 없습니다.",
      });
    }

    const { activityType, moodTag, budgetRange } = user.preference;

    const filter = {};
    if (activityType) filter.category = activityType;
    if (moodTag) filter.moodTag = moodTag;
    if (budgetRange) filter.priceRange = budgetRange;

    let places = await Place.find(filter).limit(3);

    const forceGoogle = req.query.source === "google";

    if (forceGoogle) {
      places = [];
    }

    // 1) DB에 장소가 있으면 DB 추천 사용
    if (places.length > 0) {
      const recommendations = places.map((place) => ({
        id: place._id,
        name: place.name,
        category: place.category,
        moodTag: place.moodTag,
        address: place.address,
        rating: place.rating || 0,
        latitude: place.latitude,
        longitude: place.longitude,
        priceRange: place.priceRange,
        openingHours: place.openingHours,
        photoUrl: place.photoUrl,
        description: place.description,
        isOpen: null,
        hashtags: [place.category, place.moodTag].filter(Boolean),
        score: null,
        reason: `회원님의 선호 활동(${activityType || "다양한 활동"})과 분위기(${moodTag || "다양한 분위기"})를 반영한 추천입니다.`,
      }));

      return res.json({
        success: true,
        source: "database",
        recommendations,
      });
    }

    // 2) DB에 장소가 없거나 source=google이면 Google Places API + 추천 엔진 사용
    const defaultLatitude = 35.2278;
    const defaultLongitude = 128.6817;

    const googlePlaces = await fetchPlacesByKeyword(
      activityType || "카페",
      defaultLatitude,
      defaultLongitude
    );

    const recommendations = recommendPlaces(googlePlaces, {
      preferredTags: [activityType, moodTag].filter(Boolean),
      latitude: defaultLatitude,
      longitude: defaultLongitude,
    });

    return res.json({
      success: true,
      source: "google_places",
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getRecommendations };