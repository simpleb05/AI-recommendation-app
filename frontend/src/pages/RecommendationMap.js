import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

// 1. 거리 계산 함수 (두 지점 사이의 미터 단위 거리)
const getDistance = (coord1, coord2) => {
  const R = 6371e3;
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RecommendationMapScreen({ onNavigate, userToken }) {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]); // 필터링된 장소들
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [region, setRegion] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]); // 내 즐겨찾기 목록 ID들
  const [isFavorite, setIsFavorite] = useState(false); // 현재 선택된 장소의 하트 상태
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const startPos = status === 'granted' 
        ? (await Location.getCurrentPositionAsync({})).coords 
        : { latitude: 35.2278, longitude: 128.6817 };
      
      setInitialLocation({ latitude: startPos.latitude, longitude: startPos.longitude });
      setRegion({ ...startPos, latitudeDelta: 0.015, longitudeDelta: 0.015 });
    })();

    const fetchPlaces = async () => {
      console.log("전송할 토큰:", userToken);
      try {
        const response = await fetch('http://10.0.2.2:5000/api/places', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await response.json();
        console.log("서버가 보내준 데이터 구조:", data);

        if (data.success) {
          setPlaces(data.places);
          setFilteredPlaces(data.places);}
        } catch (error) {
        console.error('데이터 통신 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchFavorites = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/favorites', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await response.json();
        console.log("즐겨찾기 목록:", data);

       if (data.success) {
      // 🌟 핵심: 객체 안의 placeId 값을 추출하여 배열로 저장
      // placeId가 객체라면 placeId._id를, 문자열이라면 placeId를 사용하세요
      const favoriteIds = data.favorites.map(fav => 
        typeof fav.placeId === 'object' ? fav.placeId._id : fav.placeId
      );
      setUserFavorites(favoriteIds); 
      }
      } catch (error) {
        console.error("즐겨찾기 목록 로드 실패:", error);
      }
    };
    fetchFavorites();
    fetchPlaces();
  }, []);

  // 2. 반경이 바뀔 때마다 장소 필터링
  useEffect(() => {
    if (initialLocation && places.length > 0) {
      const filtered = places.filter((place) => {
        const dist = getDistance(initialLocation, { 
          latitude: parseFloat(place.latitude), 
          longitude: parseFloat(place.longitude) 
        });
        return dist <= radius;
      });
      setFilteredPlaces(filtered);
    }
  }, [radius, places, initialLocation]);

  const onRegionChange = (newRegion) => {
    if (!initialLocation) return;

    // 현재 지도의 중심과 사용자 위치(initialLocation) 사이의 거리를 계산
    const dist = getDistance(
      { latitude: newRegion.latitude, longitude: newRegion.longitude },
      initialLocation
    );
    // 반경(radius)보다 멀어졌다면 다시 중심점으로 복귀
    // 약간의 여유(radius * 1.1)를 주면 사용자가 줌인/아웃할 때 덜 답답합니다.
    if (dist > radius) {
      mapRef.current?.animateToRegion({
        ...initialLocation,
        // 드래그 전과 동일한 줌 레벨을 유지하려면 현재의 delta를 그대로 사용
        latitudeDelta: newRegion.latitudeDelta,
        longitudeDelta: newRegion.longitudeDelta,
      }, 500);
    }
  };

  const toggleFavorite = async (placeId) => {
    const isCurrentlyFavorite = userFavorites.includes(placeId);
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
    
    // DELETE일 때는 URL 뒤에 /ID를 붙이고, POST일 때는 기본 경로 사용
    const url = isCurrentlyFavorite 
      ? `http://10.0.2.2:5000/api/favorites/${placeId}` 
      : `http://10.0.2.2:5000/api/favorites`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json' 
        },
        body: isCurrentlyFavorite ? null : JSON.stringify({ placeId })
      });

      // 서버 응답이 204(삭제 성공)이거나 JSON이 아닐 경우를 대비해 텍스트 확인
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text); // 여기서 파싱
      } catch (e) {
        // 서버가 JSON을 안 보내줬을 경우 (성공 메시지만 온 경우 등)
        data = { success: true }; 
      }
      
      if (data.success) {
        if (isCurrentlyFavorite) {
          setUserFavorites(prev => prev.filter(id => id !== placeId));
          alert("즐겨찾기에서 제거되었습니다.");
        } else {
          setUserFavorites(prev => [...prev, placeId]);
          alert("즐겨찾기에 추가되었습니다.");
        }
      } else {
        alert(data.message || "오류 발생");
      }
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}><Text style={styles.backButtonText}>◁ 홈으로</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>주변 장소 추천</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.radiusControl}>
        {[1, 3, 5].map((km) => (
          <TouchableOpacity 
            key={km} 
            style={[styles.radiusButton, radius === km * 1000 && styles.activeButton]} 
            onPress={() => setRadius(km * 1000)}
          >
            <Text style={radius === km * 1000 ? styles.activeText : styles.inactiveText}>{km}km</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mapContainer}>
  {/* 데이터는 왔는데 위치가 안 잡혀서 로딩이 안 끝나는 경우를 방지 */}
  {loading ? (
    <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
  ) : (
    <MapView 
      ref={mapRef} 
      style={styles.map} 
      initialRegion={{
        latitude: initialLocation?.latitude || 35.2278,
        longitude: initialLocation?.longitude || 128.6817,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }}
      showsUserLocation={true}
      onRegionChangeComplete={onRegionChange}
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
          key={place._id} 
          coordinate={{ 
            latitude: parseFloat(place.latitude), 
            longitude: parseFloat(place.longitude) 
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
    <ScrollView>
      {/* 🌟 이름과 하트를 묶어주는 헤더 영역 */}
      <View style={styles.detailHeader}>
        <Text style={styles.placeName}>{selectedPlace.name} ✨</Text>
        <TouchableOpacity onPress={() => toggleFavorite(selectedPlace._id)}>
          <Text style={{ fontSize: 28 }}>
            {userFavorites.includes(selectedPlace._id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressText}>📍 {selectedPlace.address}</Text>
      <View style={styles.divider} />
      <Text style={styles.descContent}>{selectedPlace.description}</Text>
    </ScrollView>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>핀을 선택해 상세 정보를 확인하세요.</Text>
    </View>
  )}
</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  detailCard: { height: 330, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 10 },
  placeName: { fontSize: 18, fontWeight: 'bold' },
  addressText: { fontSize: 13, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  descContent: { fontSize: 14, color: '#333' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#888' },
  radiusControl: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#fff' },
  radiusButton: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeButton: { backgroundColor: '#007AFF' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  inactiveText: { color: '#333' },
  detailHeader: {
    flexDirection: 'row',            // 가로 정렬
    justifyContent: 'space-between', // 이름은 왼쪽, 하트는 오른쪽 끝으로 배치
    alignItems: 'center',            // 하트와 텍스트의 높이를 중앙으로 맞춤
    marginBottom: 8,
  },
  placeName: {
    fontSize: 20,                    // 조금 더 키웠습니다 (취향껏 조절하세요)
    fontWeight: 'bold',
    flex: 1,                         // 이름이 길어질 경우를 대비해 공간 점유
    marginRight: 10,                 // 이름과 하트 사이의 간격
  },
});