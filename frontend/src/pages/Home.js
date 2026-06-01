import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function HomeScreen({ onNavigate }) {
  const [feedbacks, setFeedbacks] = useState({});
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

  const handleFeedback = (placeId, type) => {
    setFeedbacks(prev => ({
      ...prev,
      [placeId]: prev[placeId] === type ? null : type
    }));
  };

  const handleRefresh = () => {
    setRecommendationList(prev => [...prev].reverse());
  };

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
              <Text style={styles.profileName}>사용자님 ✨</Text>
              <Text style={styles.myPageLinkText}>마이페이지 보기 ➔</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. 오늘 뭐하고 놀지 전반적인 활동 스타일을 정하는 배너 버튼 */}
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
            <View style={styles.largeBadge}><Text style={styles.largeBadgeText}>#감성 있는</Text></View>
            <View style={styles.largeBadge}><Text style={styles.largeBadgeText}>#조용한</Text></View>
            <View style={styles.largeBadge}><Text style={styles.largeBadgeText}>#힐링</Text></View>
            <View style={styles.largeBadge}><Text style={styles.largeBadgeText}>#실내코스</Text></View>
          </View>
        </View>

        {/* 4. 새로고침 및 새 장소 추천 기능 버튼 그룹 */}
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

        {/* 6. 한눈에 들어오는 가로 배치 컴팩트 추천 리스트 */}
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