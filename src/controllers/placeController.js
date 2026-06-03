const Place = require("../models/Place");

// 장소 전체 조회
const getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.json({ success: true, places });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 장소 상세 조회
const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) {
      return res.status(404).json({ success: false, message: "장소를 찾을 수 없습니다." });
    }
    res.json({ success: true, place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 장소 검색 (카테고리, 분위기 필터)
const searchPlaces = async (req, res) => {
  try {
    const { category, moodTag, priceRange } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (moodTag) filter.moodTag = moodTag;
    if (priceRange) filter.priceRange = priceRange;

    const places = await Place.find(filter);
    res.json({ success: true, places });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlaces, getPlaceById, searchPlaces };