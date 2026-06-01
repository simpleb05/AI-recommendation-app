import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

// 📍 확장된 가상 추천 장소 상세 데이터
const DUMMY_PLACES = [
  { 
    id: 1, 
    name: '성수 가든 카페', 
    category: '카페', 
    x: 120, 
    y: 250, 
    distance: '350m', 
    address: '서울특별시 성동구 성수이로 12길 3',
    isOpen: true,
    rating: 4.8,
    reviewCount: 342,
    description: '도심 속 자연을 만끽할 수 있는 싱그러운 플랜테리어 베이커리 카페입니다.',
    reason: '사용자님이 선호하는 힙한 감성의 인테리어와 조용한 분위기를 갖추고 있어요.', 
    img: '☕' 
  },
  { 
    id: 2, 
    name: '창원 레이저 서바이벌', 
    category: '액티비티', 
    x: 230, 
    y: 140, 
    distance: '1.2km', 
    address: '경상남도 창원시 의창구 대학로 20',
    isOpen: true,
    rating: 4.9,
    reviewCount: 188,
    description: '최첨단 레이저 장비로 안전하고 짜릿하게 즐기는 실내 서바이벌 게임장입니다.',
    reason: '오늘 활동적인 놀거리를 찾으시는 무드에 딱 맞는 짜릿한 실내 액티비티 스팟입니다.', 
    img: '🎯' 
  },
  { 
    id: 3, 
    name: '모던 보드게임 카페', 
    category: '보드게임', 
    x: 80, 
    y: 110, 
    distance: '850m', 
    address: '경상남도 창원시 성산구 상남로 45',
    isOpen: false,
    rating: 4.5,
    reviewCount: 95,
    description: '500여 종의 다양한 보드게임과 프라이빗한 룸 형 좌석을 제공하는 공간입니다.',
    reason: '비 오거나 흐린 날 실내에서 연인/친구와 부담 없이 가볍게 즐기기 좋은 장소입니다.', 
    img: '🎲' 
  },
];

export default function RecommendationMapScreen({ onNavigate }) {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState('1km');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // ❤️ 즐겨찾기 상태 관리
  const [favorites, setFavorites] = useState({});

  // 💡 [수정] 홈 화면과 일치화된 개별 피드백(좋아요/별로예요) 토글 상태 객체
  const [feedbacks, setFeedbacks] = useState({});

  const handleRadiusSelect = (radius) => {
    setSelectedRadius(radius);
    setIsDropdownOpen(false);
  };

  // 즐겨찾기 토글 핸들러
  const toggleFavorite = (placeId) => {
    setFavorites(prev => ({ ...prev, [placeId]: !prev[placeId] }));
  };

  // 💡 [수정] 홈 화면의 handleFeedback과 완전히 동일한 토글 로직 적용
  const handleFeedback = (placeId, type) => {
    setFeedbacks(prev => ({
      ...prev,
      [placeId]: prev[placeId] === type ? null : type
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 홈으로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주변 장소 추천</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 2. 지도 영역 */}
      <View style={styles.mapContainer}>
        <View style={[styles.virtualMap, { transform: [{ scale: zoomLevel }] }]}>
          <View style={styles.userMarker}>
            <View style={styles.userMarkerPulse} />
            <Text style={styles.emojiText}>🙋</Text>
          </View>

          {DUMMY_PLACES.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.pinMarker,
                { left: place.x, top: place.y },
                selectedPlace?.id === place.id && styles.selectedPinMarker
              ]}
              onPress={() => setSelectedPlace(place)}
            >
              <Text style={styles.emojiText}>📍</Text>
              <View style={styles.pinLabel}>
                <Text style={styles.pinLabelText}>{place.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.6))}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity style={styles.dropdownMain} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Text style={styles.dropdownMainText}>🎯 {selectedRadius}</Text>
            <Text style={styles.dropdownArrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {isDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {['1km', '3km', '5km'].map((radius) => (
                <TouchableOpacity 
                  key={radius} 
                  style={styles.dropdownItem} 
                  onPress={() => handleRadiusSelect(radius)}
                >
                  <Text style={[styles.dropdownItemText, selectedRadius === radius && styles.activeItemText]}>
                    {radius} 반경
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 3. 하단 장소 상세 정보 구역 */}
      <View style={styles.detailCard}>
        {selectedPlace ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            
            <View style={styles.detailHeader}>
              <View style={styles.placeImageBox}>
                <Text style={styles.placeImageText}>{selectedPlace.img}</Text>
              </View>
              <View style={styles.placeMeta}>
                <View style={styles.metaTopRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selectedPlace.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, selectedPlace.isOpen ? styles.openBg : styles.closeBg]}>
                    <Text style={[styles.statusText, selectedPlace.isOpen ? styles.openText : styles.closeText]}>
                      {selectedPlace.isOpen ? '영업중' : '영업종료'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.favoriteButton} 
                onPress={() => toggleFavorite(selectedPlace.id)}
              >
                <Text style={[styles.favoriteHeart, favorites[selectedPlace.id] && styles.activeHeart]}>
                  {favorites[selectedPlace.id] ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.subInfoRow}>
              <Text style={styles.ratingText}>⭐ {selectedPlace.rating}</Text>
              <Text style={styles.reviewText}>리뷰 {selectedPlace.reviewCount}개</Text>
              <Text style={styles.distanceText}>| {selectedPlace.distance}</Text>
            </View>
            
            <Text style={styles.addressText}>🏠 {selectedPlace.address}</Text>

            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <Text style={styles.descContent}>{selectedPlace.description}</Text>
            </View>

            <View style={styles.aiSection}>
              <Text style={styles.aiTitle}>✨ AI 핵심 추천 이유</Text>
              <Text style={styles.aiContent}>{selectedPlace.reason}</Text>
            </View>

            {/* 💡 [수정] 홈 화면 디자인/이름과 100% 동일하게 매칭된 컴포넌트 마크업 구조 */}
            <View style={styles.feedbackButtonGroup}>
              <TouchableOpacity 
                style={[
                  styles.feedbackButton, 
                  feedbacks[selectedPlace.id] === 'like' && styles.feedbackLikeActive
                ]} 
                onPress={() => handleFeedback(selectedPlace.id, 'like')}
              >
                <Text style={[styles.feedbackButtonText, feedbacks[selectedPlace.id] === 'like' && styles.textActive]}>
                  👍 좋음
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.feedbackButton, 
                  feedbacks[selectedPlace.id] === 'dislike' && styles.feedbackDislikeActive
                ]} 
                onPress={() => handleFeedback(selectedPlace.id, 'dislike')}
              >
                <Text style={[styles.feedbackButtonText, feedbacks[selectedPlace.id] === 'dislike' && styles.textActive]}>
                  👎 별로
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyText}>지도 위의 핀(📍)을 선택하시면</Text>
            <Text style={styles.emptyText}>AI의 풍부한 맞춤형 추천 정보를 확인할 수 있습니다.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },

  mapContainer: { flex: 1, backgroundColor: '#e5e9f0', overflow: 'hidden', position: 'relative' },
  virtualMap: { width: '100%', height: '100%', position: 'relative', backgroundColor: '#eef2f7' },
  userMarker: { position: 'absolute', left: '50%', top: '50%', marginLeft: -16, marginTop: -16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  userMarkerPulse: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,122,255,0.2)', borderWidth: 1, borderColor: '#007AFF' },
  pinMarker: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  selectedPinMarker: { transform: [{ scale: 1.25 }], zIndex: 9 },
  pinLabel: { backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginTop: -2 },
  pinLabelText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emojiText: { fontSize: 24, textAlign: 'center' },

  zoomControls: { position: 'absolute', bottom: 20, right: 16, gap: 8, zIndex: 20 },
  zoomButton: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  zoomText: { fontSize: 22, fontWeight: '600', color: '#444' },

  dropdownWrapper: { position: 'absolute', top: 16, right: 16, width: 110, zIndex: 30 },
  dropdownMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  dropdownMainText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#666' },
  dropdownMenu: { backgroundColor: '#fff', borderRadius: 12, marginTop: 6, paddingVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItemText: { fontSize: 13, color: '#555', textAlign: 'center' },
  activeItemText: { color: '#007AFF', fontWeight: 'bold' },

  detailCard: { height: 330, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  placeImageBox: { width: 56, height: 56, backgroundColor: '#f1f3f5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  placeImageText: { fontSize: 30 },
  placeMeta: { flex: 1, marginLeft: 14 },
  metaTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  badge: { backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#007AFF', fontSize: 10, fontWeight: '700' },
  
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  openBg: { backgroundColor: '#E8F5E9' },
  closeBg: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 10, fontWeight: '700' },
  openText: { color: '#2E7D32' },
  closeText: { color: '#C62828' },
  
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  
  favoriteButton: { padding: 6, position: 'absolute', right: 0, top: 4 },
  favoriteHeart: { fontSize: 26, color: '#ccc' },

  subInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingLeft: 2 },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: '#FFB300' },
  reviewText: { fontSize: 13, color: '#666' },
  distanceText: { fontSize: 13, color: '#888' },
  addressText: { fontSize: 13, color: '#666', marginTop: 4, paddingLeft: 2 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  
  descriptionSection: { marginBottom: 10, paddingHorizontal: 2 },
  descContent: { fontSize: 14, color: '#333', lineHeight: 18, fontWeight: '500' },

  aiSection: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginBottom: 12 },
  aiTitle: { fontSize: 12, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  aiContent: { fontSize: 12, color: '#555', lineHeight: 18 },

  /* 💡 [수정] 홈 화면의 미니 피드백 스타일 및 색상을 하단 버튼 양식에 맞춰 완벽 복사 */
  feedbackButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  feedbackButton: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8f9fa', 
    paddingVertical: 10, 
    borderRadius: 6, 
    borderWidth: 1, 
    borderColor: '#e9ecef'
  },
  feedbackButtonText: { 
    fontSize: 13, 
    color: '#495057', 
    fontWeight: '500' 
  },
  
  // 홈 화면 스타일 속성 클래스 완벽 동기화
  feedbackLikeActive: { 
    backgroundColor: '#E8F5E9', 
    borderColor: '#4CAF50' 
  },
  feedbackDislikeActive: { 
    backgroundColor: '#FFEBEE', 
    borderColor: '#F44336' 
  },
  textActive: { 
    color: '#111', 
    fontWeight: 'bold' 
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 13, color: '#888', lineHeight: 20, textAlign: 'center' }
});