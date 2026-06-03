import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';

// 💡 App.js로부터 유저 인증 토큰(userToken)을 명확하게 받아옵니다!
export default function PreferencesScreen({ onNavigate, userToken }) {
  // 1. 분위기 태그 상태 관리 (다중 선택)
  const [selectedTags, setSelectedTags] = useState([]);

  // 20가지 풍성한 취향 태그 목록
  const tags = [
    '조용한', '활기찬', '활동적인', '감성 있는', 
    '가성비', '이색적인', '힐링', '실내코스',
    '익스트림', '레트로', '포토존 맛집', '따뜻한',
    '스릴 넘치는', '자연과 함께', '원데이 클래스', '야간 코스',
    '보드게임', '맛집 탐방', '산책하기 좋은', '전시/회람'
  ];

  // 태그 다중 선택/해제 함수
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 추천받기 제출 버튼 (백엔드 실제 저장 연동)
  const handleRecommend = async () => {
    // 예외 처리: 태그를 하나도 선택하지 않은 경우
    if (selectedTags.length === 0) {
      Alert.alert('알림', '최소 한 개 이상의 취향 태그를 선택해 주세요.');
      return;
    }

    try {
      // 백엔드 스키마/컨트롤러 양식에 맞춰 데이터 가공
      // 유저가 선택한 태그들을 쉼표 문자열 형태로 묶어서 보냅니다. (예: "조용한, 힐링, 맛집 탐방")
      const combinedMoodTags = selectedTags.join(', ');

      // 💡 백엔드 취향 설정 저장 API 호출 (안드로이드 에뮬레이터 주소)
      const response = await fetch('http://10.0.2.2:5000/api/user/preference', {
        method: 'PUT', // userController의 updatePreference 엔드포인트 규칙에 맞춤
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // 🔑 중요! 인증 헤더에 로그인 토큰을 실어 보냅니다.
        },
        body: JSON.stringify({
          activityType: "전체",       // 기본값 세팅
          moodTag: combinedMoodTags, // 🌟 내가 고른 진짜 태그들이 들어감!
          budgetRange: "상관없음",
          groupSize: 2
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 성공적으로 MongoDB 디비에 저장되었다면 팝업창 없이 부드럽게 홈으로 이동!
        onNavigate('Home');
      } else {
        // 토큰이 유효하지 않거나 유저를 찾지 못했을 때
        Alert.alert('저장 실패', data.message || '취향 설정을 저장하지 못했습니다.');
      }

    } catch (error) {
      console.error('취향 저장 서버 통신 에러:', error);
      Alert.alert('에러', '서버와 연결할 수 없습니다. 백엔드가 켜져 있는지 확인해 주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        
        {/* 페이지 제목 구역 */}
        <View style={styles.headerZone}>
          <Text style={styles.mainTitle}>취향 선호 조사</Text>
          <Text style={styles.subTitle}>반가워요! 사용자님의 평소 선호하는 놀거리 취향을 선택해 주세요.</Text>
        </View>

        {/* SECTION: 태그 선택 구역 */}
        <View style={styles.tagSection}>
          <Text style={styles.sectionTitle}>선호하는 태그 선택 (중복 가능)</Text>
          
          <View style={styles.tagScrollBox}>
            <ScrollView 
              nestedScrollEnabled={true} // 안드로이드 중복 스크롤 씹힘 방지
              showsVerticalScrollIndicator={true} // 우측 스크롤 바 유지
              contentContainerStyle={styles.tagGrid}
            >
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity 
                    key={tag} 
                    style={[styles.tagButton, isSelected && styles.selectedTagButton]} 
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagButtonText, isSelected && styles.selectedButtonText]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* 하단 고정 제출 버튼 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleRecommend}>
          <Text style={styles.submitButtonText}>이 조건으로 놀거리 추천받기</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  innerContainer: { flex: 1, padding: 24 },
  headerZone: { marginVertical: 20, alignItems: 'center' },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  tagSection: { flex: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 14 },
  tagScrollBox: { flex: 1, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, backgroundColor: '#fafafa', padding: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tagButton: { width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  selectedTagButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tagButtonText: { fontSize: 15, color: '#555', fontWeight: '500' },
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});