import { Ionicons } from '@expo/vector-icons';

// 1. 태그별 아이콘 매핑
const TAG_ICONS = {
  '카페': 'cafe-outline',
  '커피': 'cafe-outline',
  '보드게임': 'game-controller-outline',
  '맛집': 'restaurant-outline',
  '식당': 'restaurant-outline',
  '공원': 'leaf-outline',
  '산책': 'leaf-outline',
  '쇼핑': 'cart-outline',
  '영화': 'film-outline',
  '독서': 'book-outline',
  '운동': 'fitness-outline',
  '힐링': 'heart-outline',
  '데이트': 'rose-outline',
};

// 2. 아이콘 추출 함수 (데이터가 없을 때 기본값 반환)
export const getIconName = (tags = []) => {
  if (!tags || tags.length === 0) return 'pin-outline';
  
  // 장소의 태그들을 순회하며 매핑 객체에 있는 키워드가 포함되어 있는지 확인
  for (let tag of tags) {
    for (let key in TAG_ICONS) {
      if (tag.includes(key)) return TAG_ICONS[key];
    }
  }
  
  return 'pin-outline'; // 매칭되는 게 없으면 기본 핀 아이콘
};