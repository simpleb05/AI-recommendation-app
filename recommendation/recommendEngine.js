const { convertTypesToHashtags } = require("../data/hashtagMap");

function calculateScore(place, userPreference) {
  let score = 0;

  const placeHashtags = convertTypesToHashtags(place.types);

  userPreference.preferredTags.forEach((tag) => {
    if (placeHashtags.includes(tag)) {
      score += 30;
    }
  });

  score += place.rating * 10;

  score += Math.min(place.userRatingsTotal / 50, 20);

  if (place.isOpen === true) {
    score += 10;
  }

  return {
    ...place,
    hashtags: placeHashtags,
    score: Math.round(score),
    reason: makeReason(placeHashtags, userPreference),
  };
}

function makeReason(placeHashtags, userPreference) {
  const matchedTags = userPreference.preferredTags.filter((tag) =>
    placeHashtags.includes(tag)
  );

  if (matchedTags.length > 0) {
    return `${matchedTags.join(", ")} 취향과 잘 맞는 장소라 추천합니다.`;
  }

  return "평점과 장소 정보를 기준으로 추천합니다.";
}

function recommendPlaces(places, userPreference) {
  return places
    .map((place) => calculateScore(place, userPreference))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

module.exports = { recommendPlaces };