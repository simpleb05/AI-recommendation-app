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

const userTagMap = {
  "조용한": ["조용함"],
  "활기찬": ["활기찬"],

  "활동적인": ["야외", "관광"],
  "감성 있는": ["감성"],
  "가성비": ["식사"],

  "이색적인": ["관광", "전시"],
  "힐링": ["자연", "조용함"],

  "실내코스": ["실내"],

  "익스트림": ["관광"],
  "레트로": ["관광"],

  "포토존 맛집": ["관광", "감성", "카페"],

  "따뜻한": ["실내"],

  "스릴 넘치는": ["관광"],

  "자연과 함께": ["자연", "산책"],

  "원데이 클래스": ["전시", "문화"],

  "야간 코스": ["관광"],

  "보드게임": ["카페", "실내"],

  "맛집 탐방": ["맛집", "식사"],

  "산책하기 좋은": ["산책", "자연"],

  "전시/회람": ["전시", "문화"]
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