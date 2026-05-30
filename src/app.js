const express = require("express");
const cors = require("cors");

const app = express();

// 미들웨어 먼저
app.use(cors());
app.use(express.json());

// 라우터
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/favorites", favoriteRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const placeRoutes = require("./routes/placeRoutes");
app.use("/api/places", placeRoutes);

const recommendRoutes = require("./routes/recommendRoutes");
app.use("/api/recommend", recommendRoutes);

// 헬스체크
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running",
  });
});

module.exports = app;