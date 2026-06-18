import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { getIconName } from '../../tagIcons';
import { Ionicons } from '@expo/vector-icons';
// 💡 현재 위치 조회를 위해 Expo Location 라이브러리를 추가합니다.
import * as Location from 'expo-location';

// 🔑 App.js로부터 userToken과 함께 로그인 성공 시 킵해둔 userNickname을 정상적으로 받아옵니다.
export default function HomeScreen({ onNavigate, userToken, userNickname }) {
  // 로딩 상태 및 에러 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationList, setRecommendationList] = useState([]);

  // 🌟 [수정] App.js에서 넘겨받은 진짜 닉네임을 초기값으로 세팅하여 데이터 유실 방지!
  const [nickname, setNickname] = useState(userNickname || '사용자');
  const [userTags, setUserTags] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const profileImage = require('../../assets/profile.png');

  // 🌟 화면이 켜질 때 백엔드에서 내 취향 정보(태그)를 가져오는 함수
  const fetchUserData = async () => {
    try {
      // 백엔드 주소 규칙: /api/user/preference
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/user/preference', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // 🔑 인증 토큰 실어 나르기!
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 1. 유저 취향 문자열 ("조용한, 힐링, 맛집 탐방")을 콤마 기준으로 쪼개서 배열로 만듦
        if (data.preference && data.preference.moodTag) {
          const tagString = data.preference.moodTag;
          const parsedTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
          setUserTags(parsedTags);
        }
        
        // 2. 만약 백엔드가 취향 조회 API에서도 nickname을 챙겨준다면 동적 갱신
        if (data.nickname) {
          setNickname(data.nickname);
        } else if (data.user && data.user.nickname) {
          setNickname(data.user.nickname);
        }
      } else {
        console.log('유저 취향 데이터 로드 실패:', data.message);
      }
    } catch (error) {
      console.error('홈 화면 유저 데이터 통신 에러:', error);
    }
  };

  // 🌟 [수정] 현재 위치를 기반으로 백엔드 API에 위도, 경도, 개수 제한(limit=3)을 실어 요청하는 함수
  const fetchRecommendations = async () => {
    try {
      // 1. 휴대폰 기기의 GPS 위치 권한 요청
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      // 기본값 설정 (만약 권한 거부 시 사용할 창원대학교 중심 좌표)
      let latitude = 35.2278;
      let longitude = 128.6817;

      if (status === 'granted') {
        // 2. 실시간 현재 위치 좌표 가져오기
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
        console.log("현재 실시간 위치 정보 탐색 완료:", latitude, longitude);
      } else {
        console.log("위치 권한이 거부되어 기본 좌표(창원대)로 추천 요청을 보냅니다.");
      }

      // 3. 백엔드 컨트롤러 스펙에 맞춰 쿼리 파라미터(?latitude=...&longitude=...&limit=3) 탑재하여 fetch 전송
      const response = await fetch(
        `https://ai-recommendation-app-19jj.onrender.com/api/recommend?latitude=${latitude}&longitude=${longitude}&limit=3`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      
      const data = await response.json();
      console.log("추천 데이터 수신 완료:", JSON.stringify(data.recommendations, null, 2));
      
      if (data.success) {
        setRecommendationList(data.recommendations);
      } else {
        console.log("서버 응답 에러:", data.message);
      }
    } catch (error) {
      console.error("추천 데이터 통신 실패:", error);
    }
  };

  useEffect(() => {
    if (userToken) {
      const initData = async () => {
        setIsLoading(true); // 💡 두 API 호출이 완전히 끝나기 전에 로딩바를 계속 유지하도록 상단 배치
        await fetchUserData();      // 유저 태그 불러오기
        await fetchRecommendations(); // 위치 기반 TOP 3 데이터 불러오기
        await fetchFeedbacks();
        setIsLoading(false);
      };
      initData();
    }
  }, [userToken]);

  // 🌟 [추가] userNickname props가 변경되었을 때도 동기화되도록 안전장치 추가
  useEffect(() => {
    if (userNickname) {
      setNickname(userNickname);
    }
  }, [userNickname]);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/feedback', {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUserFeedbacks(data.feedbacks); // 받아온 피드백 배열 저장
      }
    } catch (error) {
      console.error("피드백 로드 실패:", error);
    }
  };

  const sendFeedbackToServer = async (targetId, feedbackType) => {
    const fakeObjectId = targetId
      .replace(/[^a-fA-F0-9]/g, '') 
      .padEnd(24, '0')             
      .substring(0, 24);           

    try {
      const response = await fetch('https://ai-recommendation-app-19jj.onrender.com/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ 
          placeId: fakeObjectId, 
          originalGoogleId: targetId, 
          feedback: feedbackType 
        })
      });

      const result = await response.json();
      console.log("서버 응답:", result);

      if (result.success) {
        fetchFeedbacks();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("통신 에러:", error);
      return false;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchRecommendations(); // 새로고침 버튼 클릭 시 위치 정보를 다시 추적하여 최신 데이터 수신
    setIsLoading(false);
  };

  // 서버 통신 중일 때 보여줄 로딩 뷰
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#4A6741" />
        <Text style={{ marginTop: 10, color: '#666' }}>내 위치 기반 추천 정보 검색 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. 마이프로필 상자 */}
        <TouchableOpacity style={styles.profileHeaderBox} onPress={() => onNavigate('MyProfile')}>
          <View style={styles.profileRow}>
            <Image 
              source={profileImage}
              style={styles.profileImage} 
            />
            <View style={styles.profileTextBox}>
              <Text style={styles.profileName}>{nickname}님 ✨</Text>
              <Text style={styles.myPageLinkText}>마이페이지 보기 ➔</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. 배너 버튼 */}
        <TouchableOpacity style={styles.moodBannerButton} onPress={() => onNavigate('TodayMood')}>
          <View style={styles.moodBannerLeft}>
            <Text style={styles.moodBannerEmoji}>🗺️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.moodBannerTitle}>오늘 뭐 하고 놀지 정하셨나요?</Text>
              <Text style={styles.moodBannerSub}>원하는 활동 스타일을 선택하고 맞춤 코스를 추천받으세요</Text>
            </View>
          </View>
          <View style={styles.moodBannerBadge}>
            <Text style={styles.moodBadgeText}>스타일 선택</Text>
          </View>
        </TouchableOpacity>

        {/* 3. 선택한 취향 태그 컨테이너 */}
        <View style={styles.largeTagContainer}>
          <Text style={styles.tagSectionTitle}>선택한 취향 태그</Text>
          <View style={styles.tagBadgeRow}>
            {userTags.length > 0 ? (
              userTags.map((tag, idx) => (
                <View key={idx} style={styles.largeBadge}>
                  <Text style={styles.largeBadgeText}>#{tag}</Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: '#999', paddingVertical: 4 }}>아직 등록된 취향 태그가 없습니다.</Text>
            )}
          </View>
        </View>

        {/* 4. 컨트롤 버튼 그룹 */}
        <View style={styles.controlButtonGroup}>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>새로고침</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navigateNewButton} onPress={() => onNavigate('NewRecommendation')}>
            <Text style={styles.navigateNewButtonText}>새로운 장소 추천받기</Text>
          </TouchableOpacity>
        </View>

        {/* 5. AI 추천 타이틀 구역 */}
        <View style={styles.titleZone}>
          <Text style={styles.mainTitle}>AI 추천 놀거리 Top 3</Text>
        </View>

        <View style={styles.listContainer}>
          {recommendationList.slice(0, 3).map((item, index) => {
            const place = item?.place || item;
            const dbPlaceId = place._id || place.googlePlaceId || place.id;

            if (!dbPlaceId) return null;

            return (
              <View key={dbPlaceId} style={styles.rowCard}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={getIconName(place.hashtags || [place.category])} 
                    size={40} 
                    color="#666" 
                  />
                </View>

                <View style={styles.rowCardContent}>
                  <Text style={styles.rowPlaceTitle}>{place.name}</Text>
                  <Text style={styles.rowReasonText}>{item.reason || "취향에 맞는 장소입니다."}</Text>

                  <View style={styles.rowFeedbackGroup}>
                    <TouchableOpacity 
                      style={[
                        styles.miniFeedbackButton, 
                        userFeedbacks.some(f => f.placeId?._id === dbPlaceId && f.feedback === 'like') && styles.feedbackLikeActive
                      ]}
                      onPress={async () => {
                        const newFeedback = { placeId: { _id: dbPlaceId }, feedback: 'like' };
                        setUserFeedbacks(prev => {
                          const others = prev.filter(f => (f.placeId?._id || f.placeId) !== dbPlaceId);
                          return [...others, newFeedback];
                        });
                        const success = await sendFeedbackToServer(dbPlaceId, 'like');
                        if (!success) { fetchFeedbacks(); }
                      }}
                    >
                      <Text style={[
                        styles.miniFeedbackText, 
                        userFeedbacks.some(f => f.placeId?._id === dbPlaceId && f.feedback === 'like') && styles.activeText
                      ]}>👍 좋아요</Text>
                    </TouchableOpacity>
                        
                    <TouchableOpacity 
                      style={[
                        styles.miniFeedbackButton, 
                        userFeedbacks.some(f => f.placeId?._id === dbPlaceId && f.feedback === 'dislike') && styles.feedbackDislikeActive
                      ]}
                      onPress={async () => {
                        const newFeedback = { placeId: { _id: dbPlaceId }, feedback: 'dislike' };
                        setUserFeedbacks(prev => {
                          const others = prev.filter(f => (f.placeId?._id || f.placeId) !== dbPlaceId);
                          return [...others, newFeedback];
                        });
                        const success = await sendFeedbackToServer(dbPlaceId, 'dislike');
                        if (!success) { fetchFeedbacks(); }
                      }}
                    >
                      <Text style={[
                        styles.miniFeedbackText, 
                        userFeedbacks.some(f => f.placeId?._id === dbPlaceId && f.feedback === 'dislike') && styles.activeText
                      ]}>👎 별로예요</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' }, 
  scrollContainer: { padding: 16, paddingBottom: 30 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  profileHeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#b5c9b0', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e8f0e5' },
  profileTextBox: { justifyContent: 'center' },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#4A6741' },
  myPageLinkText: { fontSize: 12, color: '#6B7F5E', marginTop: 2 },
  
  moodBannerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f0e5', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#b5c9b0', marginBottom: 16, shadowColor: '#4A6741', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  moodBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  moodBannerEmoji: { fontSize: 24, marginRight: 12 },
  moodBannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#4A6741' },
  moodBannerSub: { fontSize: 11, color: '#6B7F5E', marginTop: 3, flexShrink: 1, lineHeight: 15 },
  moodBannerBadge: { backgroundColor: '#4A6741', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  moodBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  largeTagContainer: { backgroundColor: '#fff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#b5c9b0', marginBottom: 12 },
  tagSectionTitle: { fontSize: 13, fontWeight: '600', color: '#4A6741', marginBottom: 8 },
  tagBadgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  largeBadge: { backgroundColor: '#e8f0e5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: '#b5c9b0' },
  largeBadgeText: { fontSize: 12, color: '#4A6741', fontWeight: 'bold' },
  controlButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  refreshButton: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: '#4A6741' },
  refreshButtonText: { color: '#4A6741', fontSize: 13, fontWeight: 'bold' },
  navigateNewButton: { flex: 1, backgroundColor: '#4A6741', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginLeft: 6 },
  navigateNewButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  titleZone: { marginBottom: 10, paddingLeft: 2 },
  mainTitle: { fontSize: 19, fontWeight: 'bold', color: '#4A6741' },
  
  listContainer: { marginBottom: 10 },
  rowCard: {
    flexDirection: 'row',        
    alignItems: 'center',        
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#b5c9b0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    height: 105,                 
  },
  rowCardImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#e8f0e5' },
  rowRankBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(74, 103, 65, 0.9)', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  rowRankText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  rowCardContent: {
    flex: 1,
    justifyContent: 'center',    
  },
  rowPlaceTitle: { fontSize: 15, fontWeight: 'bold', color: '#4A6741', flex: 1, marginRight: 4 },
  rowReasonText: { fontSize: 12, color: '#6B7F5E', lineHeight: 16 },
  
  rowFeedbackGroup: { flexDirection: 'row', marginTop: 2 },
  miniFeedbackButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5faf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#b5c9b0', marginRight: 6 },
  miniFeedbackText: { fontSize: 11, color: '#4A6741', fontWeight: '500' },
  feedbackLikeActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  feedbackDislikeActive: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  activeText: { color: '#111', fontWeight: 'bold' },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',    
    alignItems: 'center',        
    marginRight: 15,
  }
});