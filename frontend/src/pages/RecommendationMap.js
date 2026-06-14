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
  const [initialLocation, setInitialLocation] = useState({
  latitude: 35.2278,
  longitude: 128.6817
});
  const [userFavorites, setUserFavorites] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  const mapRef = useRef(null);

  const loadFavoritesFromStorage = async () => {
  try {
    const cached = await AsyncStorage.getItem('savedFavorites');
    if (cached) {
      const parsed = JSON.parse(cached);
      setUserFavorites(parsed);
      //console.log("로컬 스토리지에서 불러온 즐겨찾기:", parsed);
    }
  } catch (e) {
    console.error("로컬 데이터 로드 실패", e);
  }
};

  const init = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log("권한 거부됨, 기본값 창원 좌표 사용");
        setInitialLocation({ latitude: 35.2278, longitude: 128.6817 });
        return;
      }

      // 💡 여기서 에뮬레이터가 현재 위치를 정확히 가져오는지 확인
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced // High에서 Balanced로 변경하여 안정성 확보
      });

      if (location && location.coords) {
        console.log("현재 위치 성공적으로 가져옴:", location.coords);
        setInitialLocation(location.coords);
      }
    } catch (e) {
      console.error("위치 획득 중 에러 발생:", e);
      setInitialLocation({ latitude: 35.2278, longitude: 128.6817 });
    }
  };

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
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await response.json();
    console.log("원본 favorite:", data.favorites);
    if (data.success && Array.isArray(data.favorites)) {
      const normalizedFavorites = data.favorites
        .filter(fav => fav && fav.placeId) // 데이터가 있는 것만 필터
        .map(fav => {
          // 💡 핵심: placeId가 객체면 내부에서 꺼내고, 문자열이면 그대로 사용
          let idValue = "";
          if (typeof fav.placeId === 'object') {
            idValue = fav.placeId.googlePlaceId || fav.placeId._id || "";
          } else {
            idValue = fav.placeId; // 이미 문자열인 경우
          }
          
          return getHexId(idValue);
        });

      const uniqueFavorites = [...new Set(normalizedFavorites)];
      
      setUserFavorites(uniqueFavorites);
      await AsyncStorage.setItem('savedFavorites', JSON.stringify(uniqueFavorites));
      //console.log("이제 모든 데이터가 들어간 배열:", uniqueFavorites);
    }
  } catch (error) {
    console.error('즐겨찾기 로드 실패:', error);
  }
};

const fetchPlaces = async () => {
  if (loading) return; // 로딩 중이면 강제 종료
  setLoading(true);
  //console.log("요청 좌표 확인:", initialLocation.latitude, initialLocation.longitude);
  try {
    const url = `http://10.0.2.2:5000/api/recommend?latitude=${initialLocation.latitude}&longitude=${initialLocation.longitude}&radius=${radius}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await response.json();
    //console.log("서버에서 받은 전체 데이터:", data);

    if (data.success) {
      //console.log("피드백 시도하는 place 객체 내용:", JSON.stringify(data.recommendations, null, 2));
      setPlaces(data.recommendations || []);
      // 여기서 setLoading(false)를 하지 마세요! 
      // 필터링 useEffect가 끝난 후 해제되도록 위에서 처리했습니다.
    }
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
};

useEffect(() => {
    // 💡 화면이 이 컴포넌트로 전환될 때마다 데이터 갱신
    // onNavigate가 바뀌거나 currentScreen 상태가 상위에서 전달된다면
    // 그것을 감시하는 것이 가장 좋습니다.
    fetchFavorites();
    fetchFeedbacks();
  }, [userToken]); // userToken이 유지된다면 이 값이 바뀔 일은 거의 없으므로 안전합니다.

// 2. [유지] 앱 실행 시 초기화 (기존 코드 그대로)
useEffect(() => {
  const initAll = async () => {
    loadFavoritesFromStorage();
    await init();
    await fetchFavorites();
    await fetchFeedbacks();
  };
  initAll();
}, []);

useEffect(() => {
    if (initialLocation && initialLocation.latitude !== 35.2278) {
      console.log("위치 잡힘, fetchPlaces 실행!");
      fetchPlaces(); 
    }
  }, [initialLocation?.latitude, initialLocation?.longitude]);

  // 3. 데이터가 오면(places 변경) 필터링만 수행
  useEffect(() => {
    if (places.length === 0 || !initialLocation) {
      setLoading(false);
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
    setLoading(false);
    console.log("필터링 완료");
  }, [places, radius, initialLocation?.latitude]);

const toggleFavorite = async (placeInput) => {
    console.log(
    "즐겨찾기 누른 장소:",
    JSON.stringify(placeInput, null, 2)
  );
  const googlePlaceId = (typeof placeInput === 'object') ? (placeInput.id || placeInput.googlePlaceId) : placeInput;
  const hexId = getHexId(googlePlaceId);
  const isAlreadyFavorite = userFavorites.includes(hexId);

  try {
    const response = await fetch(isAlreadyFavorite 
      ? `http://10.0.2.2:5000/api/favorites/${hexId}` 
      : `http://10.0.2.2:5000/api/favorites`, {
      method: isAlreadyFavorite ? 'DELETE' : 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      ...(isAlreadyFavorite ? {} : { body: JSON.stringify({ googlePlaceId }) })
    });

    const result = await response.json();

    if (response.ok || result.message === "이미 저장된 장소입니다.") {
      // 💡 딱 한 번만 상태를 업데이트합니다.
      setUserFavorites(prev => {
        // 이미 저장된 장소라면 삭제(filter), 아니라면 추가(Set으로 중복 방지)
        const next = (isAlreadyFavorite && result.message !== "이미 저장된 장소입니다.")
          ? prev.filter(id => id !== hexId)
          : [...new Set([...prev, hexId])];
          
        // 로컬 스토리지 동기화
        AsyncStorage.setItem('savedFavorites', JSON.stringify(next));
        return next;
      });
      
      alert(isAlreadyFavorite && result.message !== "이미 저장된 장소입니다." 
        ? "즐겨찾기가 해제되었습니다." 
        : "즐겨찾기에 추가되었습니다!");
    } else {
      throw new Error(result.message || "서버 작업 실패");
    }
  } catch (error) {
    console.error("toggleFavorite 처리 중 에러:", error);
    alert("작업을 처리할 수 없습니다.");
  }
};


const toggleReaction = async (place, feedbackValue) => {
  const googlePlaceId = place.id || place.googlePlaceId;

  // 💡 핵심: 구글 ID를 24자리의 16진수로 변환 (507f1f1...)
  // 이렇게 하면 서버의 ObjectId 변환 로직을 통과할 수 있습니다.
  const hexId = googlePlaceId
    .split('')
    .map(c => c.charCodeAt(0).toString(16))
    .join('')
    .substring(0, 24)
    .padEnd(24, '0');

  try {
    const response = await fetch('http://10.0.2.2:5000/api/feedback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` 
      },
      body: JSON.stringify({ 
        placeId: hexId, // 💡 진짜 ID 대신 변환된 ID 전송
        originalGoogleId: googlePlaceId, // 만약 서버가 이 필드를 읽는다면
        feedback: feedbackValue 
      })
    });

    const result = await response.json();
    if (result.success) {
      alert("피드백이 반영되었습니다.");
    } else {
      alert("실패: 서버가 이 ID를 거부했습니다.");
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (selectedPlace) {
    const currentHexId = getHexId(selectedPlace.id || selectedPlace.googlePlaceId);
    const isFav = userFavorites.includes(currentHexId);
    
    // console.log("--- 렌더링 체크 ---");
    // console.log("선택된 장소:", selectedPlace.name);
    // console.log("비교 대상 ID:", currentHexId);
    // console.log("목록에 포함됨?:", isFav);
    // console.log("현재 userFavorites 배열 전체 내용:", JSON.stringify(userFavorites));
    // console.log("하트 UI:", isFav ? '❤️' : '🤍');
  }
}, [userFavorites, selectedPlace]);

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
  const currentHexId = selectedPlaceId 
  ? selectedPlaceId.split('').map(c => c.charCodeAt(0).toString(16)).join('').substring(0, 24).padEnd(24, '0')
  : null;

  // 2. 즐겨찾기 상태 확인
const isFavorite = React.useMemo(() => {
  if (!selectedPlace) return false;
  console.log(
    "selectedPlace id들",
    selectedPlace?._id,
    selectedPlace?.id,
    selectedPlace?.googlePlaceId
  );

  const hexId = getHexId(
    selectedPlace?.id ||
    selectedPlace?.googlePlaceId ||
    selectedPlace?._id
  );

  console.log("생성된 hexId:", hexId);
  console.log("userFavorites:", userFavorites);
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
  {/* initialLocation이 확실히 있을 때만 MapView를 렌더링합니다 */}
  {initialLocation && initialLocation.latitude && !loading ? (
    <MapView
      // 💡 key를 추가하면 initialLocation이 변경될 때 지도가 완전히 새로 그려집니다.
      // 이것이 'null' 에러를 방지하는 가장 강력한 방법입니다.
      key={`${initialLocation.latitude}-${initialLocation.longitude}`}
      ref={mapRef}
      style={styles.map}
      region={{
          latitude: initialLocation?.latitude ?? 35.2278,
          longitude: initialLocation?.longitude ?? 128.6817,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      showsUserLocation={true}
      followsUserLocation={true}
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
                key={isFavorite ? 'heart-red' : 'heart-white'} // 💡 이 key가 필수입니다!
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