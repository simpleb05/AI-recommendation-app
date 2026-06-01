const typeToHashtags = {
  cafe: ["카페", "실내"],
  coffee_shop: ["카페", "조용함"],
  bakery: ["디저트", "카페"],
  restaurant: ["맛집", "식사", "실내"],
  park: ["산책", "자연", "야외"],
  tourist_attraction: ["관광", "구경", "야외"],
  museum: ["전시", "문화", "실내"],
  art_gallery: ["전시", "감성", "실내"],
  shopping_mall: ["쇼핑", "실내"],
  movie_theater: ["영화", "실내"],
};

function convertTypesToHashtags(types) {
  const hashtags = [];

  types.forEach((type) => {
    if (typeToHashtags[type]) {
      hashtags.push(...typeToHashtags[type]);
    }
  });

  return [...new Set(hashtags)];
}

module.exports = { convertTypesToHashtags };