const { convertTypesToHashtags } = require("../data/hashtagMap");

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (Number(lat1) * Math.PI) / 180;
  const φ2 = (Number(lat2) * Math.PI) / 180;
  const Δφ = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const Δλ = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function budgetToAllowedPriceLevels(budget) {
  if (!budget) return [];

  if (budget.includes("1만원 이하")) {
    return ["PRICE_LEVEL_FREE", "PRICE_LEVEL_INEXPENSIVE"];
  }

  if (budget.includes("1만원") || budget.includes("3만원")) {
    return ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"];
  }

  if (budget.includes("5만원")) {
    return ["PRICE_LEVEL_MODERATE", "PRICE_LEVEL_EXPENSIVE"];
  }

  if (budget.includes("5만원 이상")) {
    return ["PRICE_LEVEL_EXPENSIVE", "PRICE_LEVEL_VERY_EXPENSIVE"];
  }

  return [];
}

function getPeopleTags(peopleCount) {
  if (peopleCount <= 2) {
    return ["혼자", "소수", "조용한", "카페", "전시", "산책"];
  }

  if (peopleCount <= 4) {
    return ["친구", "보드게임", "방탈출", "맛집", "카페", "활기찬"];
  }

  return ["단체", "노래방", "볼링", "단체석", "넓은", "활기찬"];
}

function calculateScore(place, userPreference) {
  let score = 0;

  const placeHashtags = convertTypesToHashtags(place.types);
  const preferredTags = userPreference.preferredTags || [];

  // 1. 취향 태그 점수
  preferredTags.forEach((tag) => {
    if (placeHashtags.includes(tag)) {
      score += 30;
    }
  });

  // 2. 인원수 점수
  const peopleTags = getPeopleTags(userPreference.peopleCount || 1);

  peopleTags.forEach((tag) => {
    if (placeHashtags.includes(tag)) {
      score += 15;
    }
  });

  // 3. 예산/가격대 점수
  const allowedPriceLevels = budgetToAllowedPriceLevels(userPreference.budget);

  if (place.priceLevel && allowedPriceLevels.includes(place.priceLevel)) {
    score += 25;
  }

  // 가격 정보가 없으면 완전 제외하지 않고 약간만 감점
  if (!place.priceLevel && allowedPriceLevels.length > 0) {
    score -= 5;
  }

  // 4. 평점 점수
  score += (place.rating || 0) * 10;

  // 5. 리뷰 수 점수
  score += Math.min((place.userRatingsTotal || 0) / 50, 20);

  if (
    userPreference.latitude &&
    userPreference.longitude &&
    place.latitude &&
    place.longitude
  ) {
    const distance = getDistance(
      userPreference.latitude,
      userPreference.longitude,
      place.latitude,
      place.longitude
    );

    if (distance <= 1000) {
      score += 30;
    } else if (distance <= 3000) {
      score += 20;
    } else if (distance <= 5000) {
      score += 10;
    }
  }

  // 6. 영업중 점수
  if (place.isOpen === true) {
    score += 10;
  }

  return {
    ...place,
    hashtags: placeHashtags,
    score: Math.round(score),
    reason: makeReason(placeHashtags, userPreference, place),
  };
}

function makeReason(placeHashtags, userPreference, place) {
  const preferredTags = userPreference.preferredTags || [];

  const matchedTags = preferredTags.filter((tag) =>
    placeHashtags.includes(tag)
  );

  if (matchedTags.length > 0) {
    return `${matchedTags.join(", ")} 취향과 잘 맞는 장소라 추천합니다.`;
  }

  if (place.priceLevel) {
    return "예산과 평점 정보를 함께 고려하여 추천합니다.";
  }

  return "평점과 장소 정보를 기준으로 추천합니다.";
}

function recommendPlaces(places, userPreference) {
  return places
    .map((place) => calculateScore(place, userPreference))
    .sort((a, b) => b.score - a.score);
}

module.exports = { recommendPlaces };