import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 경고 해결용

export default function TodayMoodScreen({ onNavigate, userToken}) {
  const [memberCount, setMemberCount] = useState('');
  const [budget, setBudget] = useState(50000); 
  const sliderWidth = useRef(0); 
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = [
    '조용한', '활기찬', '활동적인', '감성 있는', 
    '가성비', '이색적인', '힐링', '실내코스',
    '익스트림', '레트로', '포토존 맛집', '따뜻한',
    '스릴 넘치는', '자연과 함께', '원데이 클래스', '야간 코스',
    '보드게임', '맛집 탐방', '산책하기 좋은', '전시/회람'
  ];

  const handleMemberSelect = (type) => {
    setMemberCount(type);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (sliderWidth.current > 0) {
          let ratio = gestureState.moveX / sliderWidth.current;
          ratio = Math.max(0, Math.min(1, (gestureState.moveX - 24) / (sliderWidth.current - 48)));
          
          const rawBudget = ratio * 100000;
          const stepBudget = Math.round(rawBudget / 5000) * 5000;
          
          setBudget(stepBudget);
        }
      },
    })
  ).current;

  // 💡 [수정] 설정 완료 핸들러 (성공 팝업 제거 버전)
  const handleSaveSettings = async () => {
    // 예외 처리: 인원 수를 선택하지 않은 경우 (필수 유효성 검사 유지)
    if (!memberCount) {
      Alert.alert('알림', '인원 수를 선택해 주세요.');
      return;
    }
    // 예외 처리: 태그를 하나도 선택하지 않은 경우 (필수 유효성 검사 유지)
    if (selectedTags.length === 0) {
      Alert.alert('알림', '최소 한 개 이상의 태그를 선택해 주세요.');
      return;
    }

    try {
    // 1. 태그를 콤마로 구분된 문자열로 변환
    const moodTag = selectedTags.join(', ');

    // 2. 서버로 POST 요청 (태그 저장)
    const response = await fetch('http://10.0.2.2:5000/api/user/preference', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // App.js에서 넘겨받은 토큰 사용
      },
      body: JSON.stringify({ 
        memberCount, // 추가된 정보
        budget,      // 추가된 정보
        moodTag      // 핵심 취향 정보
      })
    });

    const data = await response.json();
    if (data.success) {
      // 3. 성공 시 홈으로 이동 (홈에서는 새로고침이 발생함)
      onNavigate('Home');
    } else {
      Alert.alert('저장 실패', data.message || '다시 시도해 주세요.');
    }
    } catch (error) {
      console.error('설정 저장 에러:', error);
      Alert.alert('에러', '서버와의 통신에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 구역 */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 이전</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 무드 설정</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.innerContainer} onLayout={(e) => { sliderWidth.current = e.nativeEvent.layout.width; }}>
        
        {/* SECTION 1: 인원 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>몇 분이서 놀 계획인가요?</Text>
          <View style={styles.rowButtonGroup}>
            {['1인', '2인', '3인 이상'].map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.squareButton, memberCount === type && styles.selectedSquareButton]} 
                onPress={() => handleMemberSelect(type)}
              >
                <Text style={[styles.squareButtonText, memberCount === type && styles.selectedButtonText]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION 2: 예산 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예산 범위 설정 (0원 ~ 10만원)</Text>
          <View style={styles.sliderContainer} {...panResponder.panHandlers}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderProgress, { width: `${(budget / 100000) * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${(budget / 100000) * 100}%`, marginLeft: -12 }]} />
            </View>
          </View>
          <Text style={styles.sliderAmountText}>{budget === 0 ? '0원 (무료)' : `최대 ${budget.toLocaleString()}원`}</Text>
        </View>

        {/* SECTION 3: 분위기 태그 (독립 스크롤 박스) */}
        <View style={[styles.section, { flex: 1, marginBottom: 16 }]}>
          <Text style={styles.sectionTitle}>원하는 분위기를 골라주세요 (중복 가능)</Text>
          
          <View style={styles.tagScrollBox}>
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true} 
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

        {/* 하단 고정 완료 버튼 */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSaveSettings}>
          <Text style={styles.submitButtonText}>설정 완료 후 홈으로 가기</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 50, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f1f3f5', borderRadius: 6 },
  backButtonText: { fontSize: 14, color: '#495057', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  innerContainer: { flex: 1, padding: 20 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 12 },
  rowButtonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  squareButton: { flex: 1, height: 65, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  selectedSquareButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  squareButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  sliderContainer: { height: 30, justifyContent: 'center', width: '100%' },
  sliderTrack: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, position: 'relative' },
  sliderProgress: { position: 'absolute', height: '100%', backgroundColor: '#007AFF', borderRadius: 3 },
  sliderThumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#007AFF', top: -8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 3 },
  sliderAmountText: { textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: '#007AFF', marginTop: 6 },
  tagScrollBox: { flex: 1, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, backgroundColor: '#fafafa', padding: 10 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tagButton: { width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 1, elevation: 1 },
  selectedTagButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tagButtonText: { fontSize: 14, color: '#555', fontWeight: '500' },
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 5 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});