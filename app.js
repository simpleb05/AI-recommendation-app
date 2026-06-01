const { fetchPlacesByKeyword } = require("./recommendation/placeApi");
const { recommendPlaces } = require("./recommendation/recommendEngine");

async function run() {
  const userPreference = {
    preferredTags: ["카페", "감성", "실내"],
    latitude: 35.2278,
    longitude: 128.6817,
  };

  const places = await fetchPlacesByKeyword(
    "카페",
    userPreference.latitude,
    userPreference.longitude
  );

  const recommendations = recommendPlaces(places, userPreference);

  console.log(recommendations);
}

run();