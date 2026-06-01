require("dotenv").config();

async function fetchPlacesByKeyword(keyword, latitude, longitude) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const url = "https://places.googleapis.com/v1/places:searchNearby";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.currentOpeningHours",
    },
    body: JSON.stringify({
      includedTypes: ["cafe"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: 3000,
        },
      },
      languageCode: "ko",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Google Places API 오류: ${data.error?.message || "상세 메시지 없음"}`
    );
  }

  return data.places.map((place) => ({
    id: place.id,
    name: place.displayName?.text,
    address: place.formattedAddress,
    rating: place.rating || 0,
    userRatingsTotal: place.userRatingCount || 0,
    types: place.types || [],
    latitude: place.location?.latitude,
    longitude: place.location?.longitude,
    isOpen: place.currentOpeningHours?.openNow ?? null,
  }));
}

module.exports = { fetchPlacesByKeyword };