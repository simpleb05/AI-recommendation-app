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
  const [userReactions, setUserReactions] = useState({ likes: [], dislikes: [] });
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/feedback', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("피드백 로드 실패:", error);
    }
  };

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

  const toggleReaction = async (placeId, feedbackValue) => {
  try {
    const response = await fetch('http://10.0.2.2:5000/api/feedback', {
      method: 'POST', // 서버에서 POST로 처리 중
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        placeId: placeId, 
        feedback: feedbackValue // 'like' 또는 'dislike' 문자열 전송
      })
    });

    const data = await response.json();
    if (data.success) {
      // 성공 시 목록을 다시 불러와서 상태를 최신화 (또는 로컬 상태를 즉시 변경)
      fetchFeedbacks(); 
      alert(data.message);
    }
  } catch (error) {
    console.error("피드백 저장 실패:", error);
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
          // 💡 핵심: 카드를 가로지르는 컨테이너를 flex: 1로 설정하여 높이 점유
          <View style={{ flex: 1 }}>
            
            {/* 상단 스크롤 영역 */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailHeader}>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(selectedPlace._id)}>
                  <Text style={{ fontSize: 28 }}>
                    {userFavorites.includes(selectedPlace._id) ? '❤️' : '🤍'}
                  </Text>
                </TouchableOpacity>
              </View>
               <View style={styles.infoRow}>
    <Text style={styles.ratingText}>⭐ {selectedPlace.rating || 0} ({selectedPlace.userRatingsTotal || 0}명)</Text>
    <Text style={[styles.statusText, { color: selectedPlace.isOpen ? '#28a745' : '#dc3545' }]}>
      {selectedPlace.isOpen ? '● 영업중' : '○ 영업종료'}
    </Text>
  </View>
              <Text style={styles.addressText}>📍 {selectedPlace.address}</Text>
              <View style={styles.divider} />
              <Text style={styles.descContent}>{selectedPlace.description}</Text>
              
              {/* 버튼이 아래로 밀려나기 위한 하단 여백용 View */}
              <View style={{ height: 80 }} /> 
            </ScrollView>

            {/* 하단 고정 버튼 영역 */}
            <View style={styles.buttonFooter}>
                    <TouchableOpacity 
            style={[
              styles.reactionBtn, 
              userFeedbacks.some(f => f.placeId?._id === selectedPlace._id && f.feedback === 'like') && styles.activeLike
            ]} 
            onPress={() => toggleReaction(selectedPlace._id, 'like')}
          >
            <Text style={{ fontSize: 18 }}>👍</Text>
            <Text style={styles.btnLabel}>좋아요</Text>
          </TouchableOpacity>

          {/* 별로예요 버튼 */}
          <TouchableOpacity 
            style={[
              styles.reactionBtn, 
              userFeedbacks.some(f => f.placeId?._id === selectedPlace._id && f.feedback === 'dislike') && styles.activeDislike
            ]} 
            onPress={() => toggleReaction(selectedPlace._id, 'dislike')}
          >
            <Text style={{ fontSize: 18 }}>👎</Text>
            <Text style={styles.btnLabel}>별로예요</Text>
          </TouchableOpacity>
          </View>

          </View>
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
  container: { flex: 1, backgroundColor: '#F1F8F1' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F1F8F1', borderBottomWidth: 1, borderColor: '#b5c9b0' },
  backButtonText: { fontSize: 16, color: '#4A6741', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A6741' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#4A6741' },
  addressText: { fontSize: 13, color: '#6B7F5E' },
  divider: { height: 1, backgroundColor: '#b5c9b0', marginVertical: 12 },
  descContent: { fontSize: 14, color: '#4A6741' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#6B7F5E' },
  radiusControl: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#F1F8F1' },
  radiusButton: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#e8f0e5' },
  activeButton: { backgroundColor: '#4A6741' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  inactiveText: { color: '#4A6741' },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reactionButtons: { flexDirection: 'row', alignItems: 'center' },
  detailCard: { height: 330, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 10 },
  buttonFooter: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 15 },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#b5c9b0', backgroundColor: '#fff' },
  activeLike: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  activeDislike: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  btnLabel: { fontSize: 14, fontWeight: '600', color: '#4A6741', marginLeft: 6 },
  infoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 8,
  gap: 15, // 텍스트 사이 간격
},
ratingText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#f39c12', // 별점 색상
},
statusText: {
  fontSize: 14,
  fontWeight: 'bold',
},
});