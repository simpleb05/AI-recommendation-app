import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

// 🔑 App.js로부터 로그인된 유저의 userToken을 정상적으로 받아옵니다.
export default function HomeScreen({ onNavigate, userToken }) {
  // 로딩 상태 및 에러 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState('사용자');
  const [userTags, setUserTags] = useState([]);
  
  const [feedbacks, setFeedbacks] = useState({});
  // 추천 플레이스 데이터 (우선 기존 더미를 기본값으로 유지하고 향후 AI 연동 시 활용 가능)
  const [recommendationList, setRecommendationList] = useState([
    {
      id: 1,
      title: '숲속 감성 카페 "모퉁이"',
      distance: '1.2 km',
      reason: '🌲 [감성 있는], [조용한] 분위기에 딱 맞는 아늑한 공간',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      title: '네온 레이싱 카트장',
      distance: '3.5 km',
      reason: '🏎️ [활동적인], [활기찬] 에너지를 발산할 스릴 스팟',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      title: '아날로그 레트로 오락실',
      distance: '0.8 km',
      reason: '🕹️ [가성비] 좋게 즐기는 8090 실내 데이트 코스',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=60'
    }
  ]);

  // 🌟 [추가] 화면이 켜질 때 백엔드에서 내 취향 정보(태그/닉네임)를 가져오는 함수
  const fetchUserData = async () => {
    try {
      setIsLoading(true);

      // 백엔드 주소 규칙: /api/user/preference (userController의 getPreference 매핑)
      const response = await fetch('http://10.0.2.2:5000/api/user/preference', {
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
          // 공백 제거 후 배열화
          const parsedTags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
          setUserTags(parsedTags);
        }
        
        // 💡 만약 백엔드 응답 데이터 구조에 유저 닉네임이 같이 포함되어 내려온다면 매핑 (없으면 기본값)
        if (data.nickname) {
          setNickname(data.nickname);
        }
      } else {
        console.log('유저 취향 데이터 로드 실패:', data.message);
      }
    } catch (error) {
      console.error('홈 화면 유저 데이터 통신 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 [추가] 리액트 네이티브 훅을 이용해 컴포넌트 마운트 시 자동 로드
  useEffect(() => {
    if (userToken) {
      fetchUserData();
    } else {
      setIsLoading(false); // 토큰이 없을 경우 예외 방지용 로딩 해제
    }
  }, [userToken]);

  const handleFeedback = (placeId, type) => {
    setFeedbacks(prev => ({
      ...prev,
      [placeId]: prev[placeId] === type ? null : type
    }));
  };

  const handleRefresh = () => {
    setRecommendationList(prev => [...prev].reverse());
  };

  // 서버 통신 중일 때 보여줄 로딩 뷰
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: '#666' }}>내 취향 정보 불러오는 중...</Text>
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
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }} 
              style={styles.profileImage} 
            />
            <View style={styles.profileTextBox}>
              {/* 🌟 [반영] 가짜 이름 대신 실제 내 닉네임 연동 */}
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
            {/* 🌟 [반영] 하드코딩 대신 진짜 DB에서 꺼내온 태그들 루프(map) 돌리기 */}
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

        {/* 6. 가로 배치 컴팩트 추천 리스트 */}
        <View style={styles.listContainer}>
          {recommendationList.map((item, index) => (
            <View key={item.id} style={styles.rowCard}>
              
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.rowCardImage} />
                <View style={styles.rowRankBadge}>
                  <Text style={styles.rowRankText}>{index + 1}</Text>
                </View>
              </View>
              
              <View style={styles.rowCardContent}>
                <View style={styles.rowLocationGroup}>
                  <Text style={styles.rowPlaceTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.rowDistanceText}>{item.distance}</Text>
                </View>
                
                <Text style={styles.rowReasonText} numberOfLines={2}>{item.reason}</Text>

                <View style={styles.rowFeedbackGroup}>
                  <TouchableOpacity 
                    style={[styles.miniFeedbackButton, feedbacks[item.id] === 'like' && styles.feedbackLikeActive]} 
                    onPress={() => handleFeedback(item.id, 'like')}
                  >
                    <Text style={[styles.miniFeedbackText, feedbacks[item.id] === 'like' && styles.textActive]}>👍 좋음</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.miniFeedbackButton, feedbacks[item.id] === 'dislike' && styles.feedbackDislikeActive]} 
                    onPress={() => handleFeedback(item.id, 'dislike')}
                  >
                    <Text style={[styles.miniFeedbackText, feedbacks[item.id] === 'dislike' && styles.textActive]}>👎 별로</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' }, 
  scrollContainer: { padding: 16, paddingBottom: 30 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' }, // 로딩 센터 추가
  
  profileHeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eef0f2', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' },
  profileTextBox: { justifyContent: 'center' },
  profileName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  myPageLinkText: { fontSize: 12, color: '#868e96', marginTop: 2 },
  
  moodBannerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E3F2FD', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#BBDEFB', marginBottom: 16, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  moodBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  moodBannerEmoji: { fontSize: 24, marginRight: 12 },
  moodBannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#0056b3' },
  moodBannerSub: { fontSize: 11, color: '#007AFF', marginTop: 3, flexShrink: 1, lineHeight: 15 },
  moodBannerBadge: { backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  moodBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  largeTagContainer: { backgroundColor: '#fff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#eef0f2', marginBottom: 12 },
  tagSectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  tagBadgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  largeBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: '#BBDEFB' },
  largeBadgeText: { fontSize: 12, color: '#007AFF', fontWeight: 'bold' },
  controlButtonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  refreshButton: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: '#007AFF' },
  refreshButtonText: { color: '#007AFF', fontSize: 13, fontWeight: 'bold' },
  navigateNewButton: { flex: 1, backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginLeft: 6 },
  navigateNewButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  titleZone: { marginBottom: 10, paddingLeft: 2 },
  mainTitle: { fontSize: 19, fontWeight: 'bold', color: '#111' },
  listContainer: { marginBottom: 10 },
  rowCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eef0f2', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1, height: 105 },
  imageWrapper: { position: 'relative', width: 85, height: 85 },
  rowCardImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#eee' },
  rowRankBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: 'rgba(0, 122, 255, 0.9)', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  rowRankText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  rowCardContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  rowLocationGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowPlaceTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', flex: 1, marginRight: 4 },
  rowDistanceText: { fontSize: 12, fontWeight: '700', color: '#ff3b30' },
  rowReasonText: { fontSize: 12, color: '#666', lineHeight: 16 },
  rowFeedbackGroup: { flexDirection: 'row', marginTop: 2 },
  miniFeedbackButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#e9ecef', marginRight: 6 },
  miniFeedbackText: { fontSize: 11, color: '#495057', fontWeight: '500' },
  feedbackLikeActive: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  feedbackDislikeActive: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
  textActive: { color: '#111', fontWeight: 'bold' },
});