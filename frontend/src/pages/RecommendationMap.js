import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 📍 시연용 가상 추천 장소 데이터
const DUMMY_PLACES = [
  { id: 1, name: '성수 가든 카페', category: '카페', x: 120, y: 250, distance: '350m', reason: '사용자님이 선호하는 힙한 감성의 인테리어와 조용한 분위기를 갖추고 있어요.', img: '☕' },
  { id: 2, name: '창원 레이저 서바이벌', category: '액티비티', x: 230, y: 140, distance: '1.2km', reason: '오늘 활동적인 놀거리를 찾으시는 무드에 딱 맞는 짜릿한 실내 액티비티 스팟입니다.', img: '🎯' },
  { id: 3, name: '모던 보드게임 카페', category: '보드게임', x: 80, y: 110, distance: '850m', reason: '비 오는 날 실내에서 연인/친구와 부담 없이 가볍게 즐기기 좋은 장소입니다.', img: '🎲' },
];

export default function RecommendationMapScreen({ onNavigate }) {
  // 💡 [기획 반영] 처음에는 선택된 장소가 없도록 null로 설정합니다.
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState('1km');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleRadiusSelect = (radius) => {
    setSelectedRadius(radius);
    setIsDropdownOpen(false);
  };

  // 피드백 버튼 핸들러
  const handleFeedback = (type) => {
    if (type === 'like') {
      Alert.alert('피드백 반영', '이 장소가 마음에 드셨군요! AI가 다음 추천에 적극 반영합니다.');
    } else {
      Alert.alert('피드백 반영', '불만족 처리가 완료되었습니다. 이와 유사한 장소 추천을 줄이겠습니다.');
    }
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
          {/* 중심 사용자 위치 마커 (모든 글자를 <Text> 안에 완벽히 격리) */}
          <View style={styles.userMarker}>
            <View style={styles.userMarkerPulse} />
            <Text style={styles.emojiText}>🙋</Text>
          </View>

          {/* 추천 장소 핀 마커들 */}
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

        {/* 지도 확대/축소 조작 버튼 */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.6))}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* 반경 설정 드롭다운 */}
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

      {/* 3. 하단 놀거리 상세 정보 구역 */}
      <View style={styles.detailCard}>
        {selectedPlace ? (
          // 💡 핀을 눌렀을 때만 나타나는 상세 화면
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailHeader}>
              <View style={styles.placeImageBox}>
                <Text style={styles.placeImageText}>{selectedPlace.img}</Text>
              </View>
              <View style={styles.placeMeta}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedPlace.category}</Text>
                </View>
                <Text style={styles.placeName}>{selectedPlace.name}</Text>
                <Text style={styles.distanceText}>📍 현재 위치에서 {selectedPlace.distance}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* AI 추천 이유 구역 */}
            <View style={styles.aiSection}>
              <Text style={styles.aiTitle}>✨ AI 핵심 추천 이유</Text>
              <Text style={styles.aiContent}>{selectedPlace.reason}</Text>
            </View>

            {/* 💡 [기획 반영] 좋아요 / 별로예요 버튼 구역 */}
            <View style={styles.feedbackButtonGroup}>
              <TouchableOpacity style={[styles.feedbackButton, styles.likeButton]} onPress={() => handleFeedback('like')}>
                <Text style={styles.likeButtonText}>👍 좋아요</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feedbackButton, styles.dislikeButton]} onPress={() => handleFeedback('dislike')}>
                <Text style={styles.dislikeButtonText}>👎 별로예요</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          // 💡 처음 진입해서 핀을 누르기 전 안내문구 화면
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyText}>지도 위의 핀(📍)을 선택하시면</Text>
            <Text style={styles.emptyText}>AI의 맞춤형 추천 정보를 확인할 수 있습니다.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  // 헤더 스타일
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },

  // 가상 지도 스타일
  mapContainer: { flex: 1, backgroundColor: '#e5e9f0', overflow: 'hidden', position: 'relative' },
  virtualMap: { width: '100%', height: '100%', position: 'relative', backgroundColor: '#eef2f7' },
  
  // 마커 & 에러 방지용 텍스트 격리 스타일
  userMarker: { position: 'absolute', left: '50%', top: '50%', marginLeft: -16, marginTop: -16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  userMarkerPulse: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,122,255,0.2)', borderWidth: 1, borderColor: '#007AFF' },
  pinMarker: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  selectedPinMarker: { transform: [{ scale: 1.25 }], zIndex: 9 },
  pinLabel: { backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, marginTop: -2 },
  pinLabelText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emojiText: { fontSize: 24, textAlign: 'center' },

  // 확대/축소 버튼 스타일
  zoomControls: { position: 'absolute', bottom: 20, right: 16, gap: 8, zIndex: 20 },
  zoomButton: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  zoomText: { fontSize: 22, fontWeight: '600', color: '#444' },

  // 드롭다운 스타일
  dropdownWrapper: { position: 'absolute', top: 16, right: 16, width: 110, zIndex: 30 },
  dropdownMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  dropdownMainText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  dropdownArrow: { fontSize: 10, color: '#666' },
  dropdownMenu: { backgroundColor: '#fff', borderRadius: 12, marginTop: 6, paddingVertical: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownItemText: { fontSize: 13, color: '#555', textAlign: 'center' },
  activeItemText: { color: '#007AFF', fontWeight: 'bold' },

  // 하단 상세 정보 카드 스타일
  detailCard: { height: 260, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 10 },
  detailHeader: { flexDirection: 'row', alignItems: 'center' },
  placeImageBox: { width: 64, height: 64, backgroundColor: '#f1f3f5', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  placeImageText: { fontSize: 36 },
  placeMeta: { flex: 1, marginLeft: 16 },
  badge: { backgroundColor: 'rgba(0,122,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  badgeText: { color: '#007AFF', fontSize: 11, fontWeight: '700' },
  placeName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  distanceText: { fontSize: 13, color: '#666' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 14 },
  
  // AI 추천 문구 영역
  aiSection: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 10, marginBottom: 14 },
  aiTitle: { fontSize: 13, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  aiContent: { fontSize: 13, color: '#444', lineHeight: 18 },

  // 👍 👎 피드백 버튼 그룹 스타일
  feedbackButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 4, marginBottom: 10 },
  feedbackButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  likeButton: { backgroundColor: 'rgba(0,122,255,0.05)', borderColor: '#007AFF' },
  likeButtonText: { color: '#007AFF', fontSize: 14, fontWeight: 'bold' },
  dislikeButton: { backgroundColor: '#fff', borderColor: '#d32f2f' },
  dislikeButtonText: { color: '#d32f2f', fontSize: 14, fontWeight: 'bold' },

  // 빈 상태(안내 문구) 디자인
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#888', lineHeight: 20, textAlign: 'center' }
});