const User = require("../models/User");
const Place = require("../models/Place");
const Feedback = require("../models/Feedback");

const { fetchPlacesByKeyword } = require("../../recommendation/placeApi");
const { recommendPlaces } = require("../../recommendation/recommendEngine");

const searchKeywordMap = {
  "조용한": "조용한 카페",
  "활기찬": "놀거리",
  "활동적인": "액티비티",
  "감성 있는": "감성 카페",
  "가성비": "맛집",

  "이색적인": "이색 데이트",
  "힐링": "공원",

  "실내코스": "실내 데이트",

  "익스트림": "액티비티",
  "레트로": "전통시장",

  "포토존 맛집": "포토존 카페",

  "따뜻한": "카페",

  "스릴 넘치는": "액티비티",

  "자연과 함께": "공원",

  "원데이 클래스": "공방",

  "야간 코스": "야경 명소",

  "보드게임": "보드게임 카페",

  "맛집 탐방": "맛집",

  "산책하기 좋은": "산책로",

  "전시/회람": "박물관"
};

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
      searchKeywordMap[moodTags[0]] ||
      activityKeyword ||
      "주변 가볼만한곳";

    console.log("최종 검색 키워드:", keyword);
    console.log("activityKeyword:", activityKeyword);
    
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

    // DB 추천 필터 생성
    const filter = {
      _id: { $nin: dislikedPlaceIds },
    };

    // 💡 [추가 및 보완] 사용자가 전달한 실시간 위도·경도가 있다면 DB 조회 시에도 내 주변 반경(radius) 필터를 적용합니다.
    // MongoDB 공간 쿼리를 원활히 처리하기 위해 장소 스키마(또는 인덱스)에 location(Point) 세팅이 구성되어 있어야 유연하게 작동합니다.
    // 만약 단일 위도/경도 필드 구조라면 범위를 수식으로 제한하거나, 위치 인덱스를 활용하는 것이 정석입니다.
    if (latitude && longitude) {
      filter.latitude = { $gte: latitude - (radius / 111000), $lte: latitude + (radius / 111000) };
      filter.longitude = { $gte: longitude - (radius / 91000), $lte: longitude + (radius / 91000) };
    }

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
        // 💡 프론트엔드가 어떤 명세를 요구하든 원활히 랜더링할 수 있도록 복사 정보 제공
        priceLevel: place.priceRange, 
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
    console.log("Google Places 개수:", googlePlaces.length);
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
            
            // 아린 님이 통합 조율하신 대로 priceRange 칸에 구글의 priceLevel 값을 이쁘게 저장합니다!
            priceRange: place.priceLevel || null, 

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
    console.log(
  "최종 반환 추천 개수:",
  recommendations.length
);

console.log(
  "limit 값:",
  limit
);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getRecommendations };