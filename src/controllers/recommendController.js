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

    console.log("activityType:", activityType);
    console.log("moodTag:", moodTag);

    // 기본은 Google Places 추천 사용
    // DB 추천을 보고 싶을 때만 ?source=database 사용
    const forceGoogle = req.query.source !== "database";

    const limit = req.query.limit ? Number(req.query.limit) : null;

    const moodTags = (req.query.moodTag || moodTag || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const activityKeyword =
      req.query.keyword ||
      (activityType && activityType !== "전체" ? activityType : null);

    const keyword =
      activityKeyword ||
      (moodTags.length > 0 ? moodTags.join(" ") : "놀거리");

    const selectedMoodTag = moodTags[0] || moodTag;

    const defaultLatitude = 35.2278;
    const defaultLongitude = 128.6817;

    const latitude = Number(req.query.latitude) || defaultLatitude;
    const longitude = Number(req.query.longitude) || defaultLongitude;

    const radius = Number(req.query.radius) || 3000;
    const peopleCount = Number(req.query.peopleCount) || 1;
    const budget = req.query.budget || budgetRange || null;

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

    let places = await Place.find(filter).limit(limit);

    // 기본은 DB 추천 건너뛰고 Google Places 추천 실행
    if (forceGoogle) {
      places = [];
    }

    // 1) ?source=database일 때만 피드백 반영 DB 추천 사용
    if (places.length > 0) {
      const recommendations = places.map((place) => ({
        id: place._id,
        googlePlaceId: place.googlePlaceId,
        name: place.name,
        category: place.category,
        moodTag: place.moodTag,
        address: place.address,
        rating: place.rating || 0,
        latitude: place.latitude,
        longitude: place.longitude,
        priceRange: place.priceRange,
        openingHours: place.openingHours,
        photoUrl: place.photoUrl || null,
        description: place.description,
        isOpen: place.isOpen ?? null,
        hashtags:
          place.hashtags && place.hashtags.length > 0
            ? place.hashtags
            : [place.category, place.moodTag].filter(Boolean),
        score: place.score ?? null,
        reason:
          place.reason ||
          `회원님의 선호 활동(${activityType || "다양한 활동"})과 분위기(${moodTag || "다양한 분위기"})를 반영한 추천입니다.`,
      }));

      return res.json({
        success: true,
        source: "database",
        recommendations,
      });
    }

    // 2) 기본 추천: 현재 위치 기반 Google Places + 추천 엔진 사용
    const googlePlaces = await fetchPlacesByKeyword(
      keyword,
      latitude,
      longitude,
      radius
    );

    const recommendations = recommendPlaces(googlePlaces, {
      preferredTags: [
        activityKeyword,
        ...moodTags,
        ...likedCategories,
        ...likedMoodTags,
      ].filter(Boolean),
      latitude,
      longitude,
      radius,
      peopleCount,
      budget,
    });

    // 추천 결과 DB 저장
    await Promise.all(
      recommendations.map(async (place) => {
        await Place.findOneAndUpdate(
          { googlePlaceId: place.id },
          {
            googlePlaceId: place.id,
            name: place.name,
            category: keyword,
            moodTag: selectedMoodTag,
            address: place.address,

            latitude: place.latitude,
            longitude: place.longitude,

            rating: place.rating || 0,
            userRatingsTotal: place.userRatingsTotal || 0,
            priceLevel: place.priceLevel || null,

            types: place.types || [],
            isOpen: place.isOpen,

            photoUrl: place.photoUrl || null,

            hashtags: place.hashtags || [],
            score: place.score || 0,
            reason: place.reason || "",

            description: place.reason || "",
          },
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    return res.json({
      success: true,
      source: "google_places",
      location: {
        latitude,
        longitude,
      },
      keyword,
      recommendations: limit ? recommendations.slice(0, limit) : recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getRecommendations };