const User = require("../models/User");
const Place = require("../models/Place");
const Feedback = require("../models/Feedback");

const { fetchPlacesByKeyword } = require("../../recommendation/placeApi");
const { recommendPlaces } = require("../../recommendation/recommendEngine");

// AI 추천 (사용자 선호 + 피드백 + Google Places 기반)
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

    const forceGoogle = req.query.source === "google";

    const keyword = req.query.keyword || activityType || "카페";
    const selectedMoodTag = req.query.moodTag || moodTag;

    const defaultLatitude = 35.2278;
    const defaultLongitude = 128.6817;

    const latitude = Number(req.query.latitude) || defaultLatitude;
    const longitude = Number(req.query.longitude) || defaultLongitude;

    // 싫어요한 장소 제외
    const dislikedFeedbacks = await Feedback.find({
      userId: req.userId,
      feedback: "dislike",
    });

    const dislikedPlaceIds = dislikedFeedbacks.map((f) => f.placeId);

    // 좋아요한 장소의 카테고리/분위기 추가 반영
    const likedFeedbacks = await Feedback.find({
      userId: req.userId,
      feedback: "like",
    }).populate("placeId");

    const likedCategories = likedFeedbacks
      .map((f) => f.placeId?.category)
      .filter(Boolean);

    const likedMoodTags = likedFeedbacks
      .map((f) => f.placeId?.moodTag)
      .filter(Boolean);

    // DB 추천 필터
    const filter = {
      _id: { $nin: dislikedPlaceIds },
    };

    if (activityType || likedCategories.length > 0) {
      filter.category = {
        $in: [activityType, ...likedCategories].filter(Boolean),
      };
    }

    if (moodTag || likedMoodTags.length > 0) {
      filter.moodTag = {
        $in: [moodTag, ...likedMoodTags].filter(Boolean),
      };
    }

    if (budgetRange) {
      filter.priceRange = budgetRange;
    }

    let places = await Place.find(filter).limit(3);

    // source=google이면 DB 추천 건너뛰기
    if (forceGoogle) {
      places = [];
    }

    // 1) DB에 장소가 있으면 피드백 반영 DB 추천 사용
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

    // 2) DB에 장소가 없거나 source=google이면 현재 위치 기반 Google Places 추천
    const googlePlaces = await fetchPlacesByKeyword(
      keyword,
      latitude,
      longitude
    );

    const recommendations = recommendPlaces(googlePlaces, {
      preferredTags: [keyword, selectedMoodTag, ...likedCategories, ...likedMoodTags].filter(Boolean),
      latitude,
      longitude,
    });

    return res.json({
      success: true,
      source: "google_places",
      location: {
        latitude,
        longitude,
      },
      keyword,
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