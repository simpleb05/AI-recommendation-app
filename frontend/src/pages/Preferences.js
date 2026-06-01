import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';

export default function PreferencesScreen({ onNavigate }) {
  // 1. 분위기 태그 상태 관리 (다중 선택)
  const [selectedTags, setSelectedTags] = useState([]);

  // 프로젝트 완성도를 높이기 위해 준비한 20가지 풍성한 취향 태그 목록
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

  // 추천받기 제출 버튼
  const handleRecommend = () => {
    // 예외 처리: 태그를 하나도 선택하지 않은 경우
    if (selectedTags.length === 0) {
      Alert.alert('알림', '최소 한 개 이상의 취향 태그를 선택해 주세요.');
      return;
    }

    Alert.alert(
      '선호도 입력 완료',
      `선택하신 태그: ${selectedTags.join(', ')}\n\n이 조건에 맞는 개인 맞춤형 놀거리를 추천합니다!`,
      [
        {
          text: '확인',
          // [확인] 버튼 클릭 시 메인 홈 화면(Home)으로 이동
          onPress: () => onNavigate('Home') 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        
        {/* 페이지 제목 구역 */}
        <View style={styles.headerZone}>
          <Text style={styles.mainTitle}>취향 선호 조사</Text>
          <Text style={styles.subTitle}>원하는 분위기를 골라주시면 AI가 놀거리를 추천해 드립니다.</Text>
        </View>

        {/* SECTION: 태그 선택 구역 (인원/예산이 빠져서 화면 대부분을 차지하며 독립 스크롤 됩니다) */}
        <View style={styles.tagSection}>
          <Text style={styles.sectionTitle}>선호하는 태그 선택 (중복 가능)</Text>
          
          <View style={styles.tagScrollBox}>
            <ScrollView 
              nestedScrollEnabled={true} // 안드로이드 중복 스크롤 씹힘 방지
              showsVerticalScrollIndicator={true} // 우측 스크롤 바 유치
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
  
  // 헤더 타이틀 디자인
  headerZone: { marginVertical: 20, alignItems: 'center' },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  
  // 태그 구역 레이아웃 (화면 전체 가용 높이를 꽉 채우도록 flex: 1 설정)
  tagSection: { flex: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 14 },
  
  // 태그들을 감싸는 독립 스크롤 박스 (더 넓고 쾌적하게 뷰포트 확보)
  tagScrollBox: { flex: 1, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, backgroundColor: '#fafafa', padding: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tagButton: { width: '48%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  selectedTagButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tagButtonText: { fontSize: 15, color: '#555', fontWeight: '500' },
  
  // 선택되었을 때 글자 스타일
  selectedButtonText: { color: '#fff', fontWeight: 'bold' },
  
  // 하단 최종 제출 버튼 스타일 (항상 하단에 고정)
  submitButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});