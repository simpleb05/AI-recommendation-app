import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

const getDistance = (coord1, coord2) => {
  const R = 6371e3;
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getPlaceId = (place) => {
  return place?._id || place?.googlePlaceId || place?.id;
};

export default function RecommendationMapScreen({ onNavigate, userToken }) {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [initialLocation, setInitialLocation] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  const mapRef = useRef(null);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/feedback', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUserFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('피드백 로드 실패:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/favorites', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      console.log('즐겨찾기 목록:', data);

      if (data.success) {
        const favoriteIds = (data.favorites || []).map((fav) =>
          typeof fav.placeId === 'object' ? fav.placeId._id : fav.placeId
        );

        setUserFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 로드 실패:', error);
    }
  };

  const fetchPlaces = async () => {
    console.log('전송할 토큰:', userToken);

    try {
      const response = await fetch('http://10.0.2.2:5000/api/recommend', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const validPlaces = (data.recommendations || []).filter(
          (place) => place.latitude && place.longitude
        );

        console.log('추천 API 결과 개수:', validPlaces.length);

        setPlaces(validPlaces);
        setFilteredPlaces(validPlaces);

        // if (validPlaces.length > 0) {
        //   const firstPlace = validPlaces[0];

        //   setTimeout(() => {
        //     mapRef.current?.animateToRegion(
        //       {
        //         latitude: parseFloat(firstPlace.latitude),
        //         longitude: parseFloat(firstPlace.longitude),
        //         latitudeDelta: 0.03,
        //         longitudeDelta: 0.03,
        //       },
        //       500
        //     );
        //   }, 500);
        // }
      } else {
        console.log('추천 장소 로드 실패:', data.message);
      }
    } catch (error) {
      console.error('데이터 통신 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        const startPos =
          status === 'granted'
            ? (await Location.getCurrentPositionAsync({})).coords
            : { latitude: 35.2278, longitude: 128.6817 };

        setInitialLocation({
          latitude: startPos.latitude,
          longitude: startPos.longitude,
        });
      } catch (error) {
        console.error('위치 정보 로드 실패:', error);

        setInitialLocation({
          latitude: 35.2278,
          longitude: 128.6817,
        });
      }

      await fetchFavorites();
      await fetchFeedbacks();
      await fetchPlaces();
    };

    init();
  }, []);

  useEffect(() => {
    if (!places.length) return;

    if (!initialLocation) {
      setFilteredPlaces(places);
      return;
    }

    const filtered = places.filter((place) => {
      const dist = getDistance(initialLocation, {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
      });

      return dist <= radius;
    });

    const displayPlaces = filtered;

    console.log('추천 전체 개수:', places.length);
    console.log('반경 필터 후 개수:', filtered.length);
    console.log('지도에 표시할 개수:', displayPlaces.length);

    setFilteredPlaces(displayPlaces);
  }, [radius, places, initialLocation]);

  const toggleFavorite = async (placeId) => {
    if (!placeId) return;

    const isCurrentlyFavorite = userFavorites.includes(placeId);
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';

    const url = isCurrentlyFavorite
      ? `http://10.0.2.2:5000/api/favorites/${placeId}`
      : 'http://10.0.2.2:5000/api/favorites';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: isCurrentlyFavorite ? null : JSON.stringify({ placeId }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { success: true };
      }

      if (data.success) {
        if (isCurrentlyFavorite) {
          setUserFavorites((prev) => prev.filter((id) => id !== placeId));
          alert('즐겨찾기에서 제거되었습니다.');
        } else {
          setUserFavorites((prev) => [...prev, placeId]);
          alert('즐겨찾기에 추가되었습니다.');
        }
      } else {
        alert(data.message || '오류 발생');
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    }
  };

  const toggleReaction = async (placeId, feedbackValue) => {
    if (!placeId) return;

    try {
      const response = await fetch('http://10.0.2.2:5000/api/feedback', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId,
          feedback: feedbackValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchFeedbacks();
        alert(data.message);
      } else {
        alert(data.message || '피드백 저장 실패');
      }
    } catch (error) {
      console.error('피드백 저장 실패:', error);
    }
  };

  const moveToPlace = (place) => {
    setSelectedPlace(place);

    mapRef.current?.animateToRegion(
      {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
  };

  const selectedPlaceId = getPlaceId(selectedPlace);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 홈으로</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>주변 장소 추천</Text>

        <View style={{ width: 60 }} />
      </View>

      <View style={styles.radiusControl}>
        {[1, 3, 5].map((km) => (
          <TouchableOpacity
            key={km}
            style={[
              styles.radiusButton,
              radius === km * 1000 && styles.activeButton,
            ]}
            onPress={() => {
              setRadius(km * 1000);
              setSelectedPlace(null);

              if (initialLocation && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: initialLocation.latitude,
                    longitude: initialLocation.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                  },
                  500
                );
              }
            }}
          >
            <Text
              style={radius === km * 1000 ? styles.activeText : styles.inactiveText}
            >
              {km}km
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude:
                filteredPlaces[0]?.latitude
                  ? parseFloat(filteredPlaces[0].latitude)
                  : initialLocation?.latitude || 35.2278,
              longitude:
                filteredPlaces[0]?.longitude
                  ? parseFloat(filteredPlaces[0].longitude)
                  : initialLocation?.longitude || 128.6817,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            showsUserLocation={true}
          >
            {initialLocation && (
              <Circle
                center={initialLocation}
                radius={radius}
                strokeColor="rgba(0, 122, 255, 0.5)"
                fillColor="rgba(0, 122, 255, 0.2)"
              />
            )}

            {filteredPlaces.map((place) => (
              <Marker
                key={getPlaceId(place)}
                coordinate={{
                  latitude: parseFloat(place.latitude),
                  longitude: parseFloat(place.longitude),
                }}
                title={place.name}
                onPress={() => setSelectedPlace(place)}
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.detailCard}>
        {selectedPlace ? (
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailHeader}>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>

                <TouchableOpacity onPress={() => toggleFavorite(selectedPlaceId)}>
                  <Text style={{ fontSize: 28 }}>
                    {userFavorites.includes(selectedPlaceId) ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.ratingText}>
                  ⭐ {selectedPlace.rating || 0} (
                  {selectedPlace.userRatingsTotal || 0}명)
                </Text>

                <Text
                  style={[
                    styles.statusText,
                    { color: selectedPlace.isOpen ? '#28a745' : '#dc3545' },
                  ]}
                >
                  {selectedPlace.isOpen ? '● 영업중' : '○ 영업정보 없음'}
                </Text>
              </View>

              <Text style={styles.addressText}>📍 {selectedPlace.address}</Text>

              <View style={styles.divider} />

              <Text style={styles.descContent}>
                {selectedPlace.description ||
                  selectedPlace.reason ||
                  '추천 장소입니다.'}
              </Text>

              <View style={{ height: 80 }} />
            </ScrollView>

            <View style={styles.buttonFooter}>
              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => toggleReaction(selectedPlaceId, 'like')}
              >
                <Text style={{ fontSize: 18 }}>👍</Text>
                <Text style={styles.btnLabel}>좋아요</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => toggleReaction(selectedPlaceId, 'dislike')}
              >
                <Text style={{ fontSize: 18 }}>👎</Text>
                <Text style={styles.btnLabel}>별로예요</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => setSelectedPlace(null)}
              >
                <Text style={styles.btnLabel}>목록 보기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.placeName}>추천 장소 목록</Text>

            {filteredPlaces.length === 0 ? (
              <Text style={styles.emptyText}>추천 장소가 없습니다.</Text>
            ) : (
              filteredPlaces.map((place, index) => (
                <TouchableOpacity
                  key={getPlaceId(place)}
                  style={styles.listItem}
                  onPress={() => moveToPlace(place)}
                >
                  <Text style={styles.listTitle}>
                    {index + 1}. {place.name}
                  </Text>

                  <Text style={styles.listSubText}>
                    ⭐ {place.rating || 0} · {place.address}
                  </Text>

                  <Text style={styles.listReason}>
                    {place.reason || '추천 장소입니다.'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F1F8F1',
    borderBottomWidth: 1,
    borderColor: '#b5c9b0',
  },

  backButtonText: {
    fontSize: 16,
    color: '#4A6741',
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6741',
  },

  mapContainer: { flex: 1 },

  map: { width: '100%', height: '100%' },

  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6741',
    marginBottom: 10,
  },

  addressText: {
    fontSize: 13,
    color: '#6B7F5E',
  },

  divider: {
    height: 1,
    backgroundColor: '#b5c9b0',
    marginVertical: 12,
  },

  descContent: {
    fontSize: 14,
    color: '#4A6741',
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7F5E',
    marginTop: 10,
  },

  radiusControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F1F8F1',
  },

  radiusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e8f0e5',
  },

  activeButton: {
    backgroundColor: '#4A6741',
  },

  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  inactiveText: {
    color: '#4A6741',
  },

  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailCard: {
    height: 330,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
  },

  buttonFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
    flexWrap: 'wrap',
  },

  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#b5c9b0',
    backgroundColor: '#fff',
  },

  btnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6741',
    marginLeft: 6,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 15,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },

  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  listTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A6741',
  },

  listSubText: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  listReason: {
    fontSize: 12,
    color: '#6B7F5E',
    marginTop: 3,
  },
});