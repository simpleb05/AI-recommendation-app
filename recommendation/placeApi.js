require("dotenv").config();

async function getPhotoUrl(photoName, apiKey) {
  if (!photoName) return null;

  const response = await fetch(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true`,
    {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.log("사진 API 오류:", data.error?.message);
    return null;
  }

  return data.photoUri || null;
}

async function fetchPlacesByKeyword(keyword, latitude, longitude) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.currentOpeningHours,places.photos",
    },
    body: JSON.stringify({
      textQuery: keyword,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude, longitude },
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

  const places = await Promise.all(
    (data.places || []).map(async (place) => {
      const photoName = place.photos?.[0]?.name || null;
      const photoUrl = await getPhotoUrl(photoName, apiKey);

      return {
        id: place.id,
        name: place.displayName?.text,
        address: place.formattedAddress,
        rating: place.rating || 0,
        userRatingsTotal: place.userRatingCount || 0,
        types: place.types || [],
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        isOpen: place.currentOpeningHours?.openNow ?? null,
        photoUrl,
      };
    })
  );

  console.log("places 개수:", places.length);
  return places;
}

module.exports = { fetchPlacesByKeyword };