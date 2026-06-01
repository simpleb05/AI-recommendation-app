import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView, PanResponder } from 'react-native';

export default function PreferencesScreen({ onNavigate }) {
  // 1. 인원 수 상태 관리 (단일 선택)
  const [memberCount, setMemberCount] = useState('');

  // 2. 예산 범위 상태 관리 (0원 ~ 100,000원)
  const [budget, setBudget] = useState(50000); // 초기값 5만 원
  const sliderWidth = useRef(0); // 슬라이드바의 실제 가로 길이를 저장할 변수

  // 3. 분위기 태그 상태 관리 (다중 선택)
  const [selectedTags, setSelectedTags] = useState([]);

  // 교수님 제출용으로도 보기 좋게 취향 태그 종류를 대폭 늘렸습니다! (총 20개)
  const tags = [
    '조용한', '활기찬', '활동적인', '감성 있는', 
    '가성비', '이색적인', '힐링', '실내코스',
    '익스트림', '레트로', '포토존 맛집', '따뜻한',
    '스릴 넘치는', '자연과 함께', '원데이 클래스', '야간 코스',
    '보드게임', '맛집 탐방', '산책하기 좋은', '전시/회람'
  ];

  // 인원 수 선택 함수
  const handleMemberSelect = (type) => {
    setMemberCount(type);
  };

  // 태그 다중 선택/해제 함수
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 슬라이드바 드래그(제스처) 인식 로직 생성
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (sliderWidth.current > 0) {
          // 터치한 X축 위치를 바탕으로 비율 계산 (0 ~ 1 사이 값)
          let ratio = gestureState.moveX / sliderWidth.current;
          // 좌우 여백 및 터치 오차 보정치 적용
          ratio = Math.max(0, Math.min(1, (gestureState.moveX - 24) / (sliderWidth.current - 48)));
          
          // 0원 ~ 10만원 사이를 5천원 단위로 딱딱 떨어지게 스냅 조정
          const rawBudget = ratio * 100000;
          const stepBudget = Math.round(rawBudget / 5000) * 5000;
          
          setBudget(stepBudget);
        }
      },
    })
  ).current;

  // 추천받기 제출 버튼
  const handleRecommend = () => {
    if (!memberCount) {
      Alert.alert('알림', '인원 수를 선택해 주세요.');
      return;
    }
    if (selectedTags.length === 0) {
      Alert.alert('알림', '최소 한 개 이상의 태그를 선택해 주세요.');
      return;
    }

    Alert.alert(
      '선호도 입력 완료',
      `인원: ${memberCount}\n예산: ${budget.toLocaleString()}원 이하\n선택 태그: ${selectedTags.join(', ')}\n\n이 조건으로 메인 추천 화면으로 이동합니다!`,
      [
        {
          text: '확인',
          onPress: () => onNavigate('Home') 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 전체 화면 레이아웃: 
        인원 선택과 예산은 고정하고, 태그 컨테이너만 독립 스크롤되도록 ScrollView 위치를 조정했습니다.
      */}
      <View style={styles.innerContainer} onLayout={(e) => { sliderWidth.current = e.nativeEvent.layout.width; }}>
        
        {/* 페이지 제목 */}
        <Text style={styles.mainTitle}>선호 입력</Text>

        {/* SECTION 1: 인원 선택 구역 (고정) */}
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

        {/* SECTION 2: 예산 범위 슬라이더 구역 (고정) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>예산 범위 설정 (0원 ~ 10만원)</Text>
          <View style={styles.sliderContainer} {...panResponder.panHandlers}>
            {/* 슬라이더 트랙 배경 */}
            <View style={styles.sliderTrack}>
              {/* 채워지는 게이지 효과 */}
              <View style={[styles.sliderProgress, { width: `${(budget / 100000) * 100}%` }]} />
              {/* 드래그할 수 있는 동그란 손잡이(Thumb) */}
              <View style={[styles.sliderThumb, { left: `${(budget / 100000) * 100}%`, marginLeft: -12 }]} />
            </View>
          </View>
          <Text style={styles.sliderAmountText}>{budget === 0 ? '0원 (무료)' : `최대 ${budget.toLocaleString()}원`}</Text>
        </View>

        {/* SECTION 3: 태그 선택 구역 (★ 이 박스 내부만 위아래로 독립 스크롤 됩니다) */}
        <View style={[styles.section, { flex: 1, marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>원하는 분위기를 골라주세요 (중복 가능)</Text>
          
          {/* 태그가 담기는 테두리 박스 컨테이너 고정 높이 부여 */}
          <View style={styles.tagScrollBox}>
            <ScrollView 
              nestedScrollEnabled={true} // 안드로이드 중복 스크롤 방지 활성화
              showsVerticalScrollIndicator={true} // 스크롤바 표시
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

        {/* SECTION 4: 추천받기 제출 버튼 (하단 고정) */}
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
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#111', textAlign: 'center', marginVertical: 15 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 14 },
  
  // 인원수 버튼 스타일
  rowButtonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  squareButton: { flex: 1, height: 80, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  selectedSquareButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  squareButtonText: { fontSize: 15, fontWeight: '600', color: '#666' },
  
  // 드래그 슬라이더 스타일
  sliderContainer: { height: 30, justifyContent: 'center', width: '100%' },
  sliderTrack: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, position: 'relative' },
  sliderProgress: { position: 'absolute', height: '100%', backgroundColor: '#007AFF', borderRadius: 3 },
  sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#007AFF', top: -9, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  sliderAmountText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginTop: 8 },
  
  // ★ 내부 스크롤 태그 박스 영역 스타일
  tagScrollBox: { flex: 1, height: 200, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, backgroundColor: '#fafafa', padding: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tagButton: { width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  selectedTagButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tagButtonText: { fontSize: 14, color: '#555', fontWeight: '500' },
  
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  
  // 하단 고정 제출 버튼 스타일
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});