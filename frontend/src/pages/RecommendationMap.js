import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert
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

const getHexId = (id) => {
  if (!id) return '';
  return id.toString()
    .split('')
    .map(c => c.charCodeAt(0).toString(16))
    .join('')
    .substring(0, 24)
    .padEnd(24, '0');
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
  const [initialLocation, setInitialLocation] = useState(null); // 💡 명확한 분기를 위해 초기값을 null로 둡니다.
  const [userFavorites, setUserFavorites] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  const mapRef = useRef(null);

  const loadFavoritesFromStorage = async () => {
    try {
      const cached = await AsyncStorage.getItem('savedFavorites');
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserFavorites(parsed);
      }
    } catch (e) {
      console.error("로컬 데이터 로드 실패", e);
    }
  };

  // 💡 위치를 가져오는 로직을 Home.js처럼 튼튼하게 개선했습니다.
  const initLocationAndFetch = async () => {
    try {
      setLoading(true);
      let latitude = 35.2278; // 기본 창원대 좌표
      let longitude = 128.6817;

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({ 
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000 // 5초 타임아웃 방어막
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
          console.log("지도 현재 위치 확보:", latitude, longitude);
        } catch (e) {
          console.log("지도 화면 에뮬레이터 위치 획득 실패, 기본값 사용");
        }
      }

      // 상태에 위치 저장
      setInitialLocation({ latitude, longitude });

      // 위치가 확정되었으니 바로 이어서 백엔드에 장소 리스트를 요청합니다!
      await fetchPlaces(latitude, longitude);

    } catch (e) {
      console.error("초기화 중 에러 발생:", e);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/feedback', {
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
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/favorites', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.favorites)) {
        const normalizedFavorites = data.favorites
          .filter(fav => fav && fav.placeId)
          .map(fav => {
            let idValue = "";
            if (typeof fav.placeId === 'object') {
              idValue = fav.placeId.googlePlaceId || fav.placeId._id || "";
            } else {
              idValue = fav.placeId;
            }
            return getHexId(idValue);
          });

        const uniqueFavorites = [...new Set(normalizedFavorites)];
        setUserFavorites(uniqueFavorites);
        await AsyncStorage.setItem('savedFavorites', JSON.stringify(uniqueFavorites));
      }
    } catch (error) {
      console.error('즐겨찾기 로드 실패:', error);
    }
  };

  // 💡 위치를 인자로 받아 곧바로 API를 호출하게 수정했습니다.
  const fetchPlaces = async (lat, lng) => {
    try {
      // radius 파라미터를 넘겨주어 백엔드가 범위에 맞게 찾아오게 합니다.
      const url = `https://ai-recommendation-app-19jj.onrender.com/api/recommend?latitude=${lat}&longitude=${lng}&radius=${radius}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await response.json();

      if (data.success) {
        setPlaces(data.recommendations || []);
      }
    } catch (error) {
      console.error("지도 장소 가져오기 실패:", error);
    } finally {
      setLoading(false); // 여기서 로딩을 끝냅니다.
    }
  };

  // 1. 앱 진입 시 한 번만 실행되도록 통합
  useEffect(() => {
    const initAll = async () => {
      loadFavoritesFromStorage();
      await fetchFavorites();
      await fetchFeedbacks();
      await initLocationAndFetch(); // 위치 구하고 장소까지 한 번에 다 가져오기
    };
    initAll();
  }, []);

  // 2. 검색 반경(1km, 3km) 버튼을 누르거나, places 배열에 데이터가 들어오면 거리순 필터링
  useEffect(() => {
    if (places.length === 0 || !initialLocation) {
      setFilteredPlaces([]);
      return;
    }

    const filtered = places.filter((place) => {
      const dist = getDistance(initialLocation, {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
      });
      return dist <= radius;
    });

    setFilteredPlaces(filtered);
  }, [places, radius, initialLocation]);

  const toggleFavorite = async (placeInput) => {
    const googlePlaceId = (typeof placeInput === 'object') ? (placeInput.id || placeInput.googlePlaceId) : placeInput;
    const hexId = getHexId(googlePlaceId);
    const isAlreadyFavorite = userFavorites.includes(hexId);

    try {
      const response = await fetch(isAlreadyFavorite 
        ? `https://ai-recommendation-app-19jj.onrender.com/api/favorites/${hexId}` 
        : `https://ai-recommendation-app-19jj.onrender.com/api/favorites`, {
        method: isAlreadyFavorite ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        ...(isAlreadyFavorite ? {} : { body: JSON.stringify({ googlePlaceId }) })
      });

      const result = await response.json();

      if (response.ok || result.message === "이미 저장된 장소입니다.") {
        setUserFavorites(prev => {
          const next = (isAlreadyFavorite && result.message !== "이미 저장된 장소입니다.")
            ? prev.filter(id => id !== hexId)
            : [...new Set([...prev, hexId])];
            
          AsyncStorage.setItem('savedFavorites', JSON.stringify(next));
          return next;
        });
        
        alert(isAlreadyFavorite && result.message !== "이미 저장된 장소입니다." 
          ? "즐겨찾기가 해제되었습니다." 
          : "즐겨찾기에 추가되었습니다!");
      }
    } catch (error) {
      console.error("toggleFavorite 처리 중 에러:", error);
    }
  };

  const toggleReaction = async (place, feedbackValue) => {
    const googlePlaceId = place.id || place.googlePlaceId;
    const hexId = getHexId(googlePlaceId);

    try {
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify({ 
          placeId: hexId,
          originalGoogleId: googlePlaceId,
          feedback: feedbackValue 
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("피드백이 반영되었습니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const moveToPlace = (place) => {
    console.log("목록 클릭:", place.name);
    setSelectedPlace(place);

    mapRef.current?.animateToRegion(
      {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      },
      500
    );
  };

  const selectedPlaceId = getPlaceId(selectedPlace);

  const isFavorite = React.useMemo(() => {
    if (!selectedPlace) return false;
    const hexId = getHexId(selectedPlace?.id || selectedPlace?.googlePlaceId || selectedPlace?._id);
    return userFavorites.includes(hexId);
  }, [userFavorites, selectedPlace]);

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
              setRadius(km * 1000); // 💡 반경이 바뀌면 useEffect가 감지해서 화면을 갱신합니다.
              setSelectedPlace(null);

              if (initialLocation && mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: initialLocation.latitude,
                    longitude: initialLocation.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
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
        {initialLocation && !loading ? (
          <MapView
            key={`${initialLocation.latitude}-${initialLocation.longitude}`}
            ref={mapRef}
            style={styles.map}
            initialRegion={{
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
            showsUserLocation={true}
            followsUserLocation={false}
          >
            <Circle
              center={{ 
                latitude: initialLocation.latitude, 
                longitude: initialLocation.longitude 
              }}
              radius={radius}
              strokeColor="rgba(0, 122, 255, 0.5)"
              fillColor="rgba(0, 122, 255, 0.2)"
            />
            {filteredPlaces.map((place) => (
              <Marker
              pinColor={
                  selectedPlace &&
                  getPlaceId(selectedPlace) === getPlaceId(place)
                    ? "blue"
                    : "red"
                }
                key={getPlaceId(place)}
                coordinate={{
                  latitude: parseFloat(place.latitude),
                  longitude: parseFloat(place.longitude),
                }}
                title={place.name}
                onPress={() => {
                  console.log("선택된 장소:", place.name);
                  setSelectedPlace(place);
                }}
              />
            ))}
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#4A6741" style={{ flex: 1 }} />
        )}
      </View>

      <View style={styles.detailCard}>
        {selectedPlace ? (
          <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailHeader}>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>

              <TouchableOpacity onPress={() => toggleFavorite(selectedPlace)}>
                <Text 
                key={isFavorite ? 'heart-red' : 'heart-white'}
                style={{ fontSize: 24 }}
              >
                  {isFavorite ? '❤️' : '🤍'}
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
                onPress={() => toggleReaction({ id: selectedPlaceId }, 'like')}
              >
                <Text style={{ fontSize: 18 }}>👍</Text>
                <Text style={styles.btnLabel}>좋아요</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => toggleReaction({ id: selectedPlaceId }, 'dislike')}
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