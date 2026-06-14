const Favorite = require("../models/Favorite");
const Place = require("../models/Place");

// 즐겨찾기 추가
const addFavorite = async (req, res) => {
  try {
    const { googlePlaceId } = req.body;

    const place = await Place.findOne({
      googlePlaceId
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "해당 장소를 찾을 수 없습니다."
      });
    }

    const existing = await Favorite.findOne({
      userId: req.userId,
      placeId: place._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "이미 저장된 장소입니다."
      });
    }

    await Favorite.create({
      userId: req.userId,
      placeId: place._id
    });

    res.status(201).json({
      success: true,
      message: "즐겨찾기 추가 완료"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 즐겨찾기 목록 조회
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId }).populate("placeId");
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 즐겨찾기 삭제
const deleteFavorite = async (req, res) => {
  try {
    const { placeId } = req.params;
    await Favorite.findOneAndDelete({ userId: req.userId, placeId });
    res.json({ success: true, message: "즐겨찾기 삭제 완료" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addFavorite, getFavorites, deleteFavorite };