const mongoose = require("mongoose");
require("dotenv").config();

const { fetchPlacesByKeyword } = require("./recommendation/placeApi");
const { recommendPlaces } = require("./recommendation/recommendEngine");

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

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

  console.log("📍 추천 결과");
  console.log(recommendations);
}

run();