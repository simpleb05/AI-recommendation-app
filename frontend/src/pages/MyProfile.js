import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getIconName } from '../../tagIcons';
import { Ionicons } from '@expo/vector-icons';

// 🔑 App.js로부터 로그인 시 킵해둔 진짜 데이터(userNickname, userEmail)를 정확히 받아옵니다.
export default function MyProfileScreen({ onNavigate, userToken, userNickname, userEmail }) {
  // 이용 안내 모달 팝업의 열림/닫힘 상태 관리
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [myFavorites, setMyFavorites] = useState([]);

  // 🌟 서버에서 즐겨찾기 목록 불러오기
  useEffect(() => {
    const fetchMyFavorites = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/favorites', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await response.json();
        console.log("서버에서 받아온 즐겨찾기 목록:", data);

        if (data.success) {
          setMyFavorites(data.favorites); // 서버에서 받은 배열 저장
        }
      } catch (error) {
        console.error("즐겨찾기 목록 로드 실패:", error);
      }
    };
    fetchMyFavorites();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 홈으로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이 프로필</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }} 
            style={styles.avatar} 
          />
          {/* 🔑 [수정 완료] 복잡하고 에러 나던 fetch를 제거하고, App.js가 배달해 준 진짜 정보를 바로 렌더링합니다! */}
          <Text style={styles.username}>{userNickname || '사용자'}님 ✨</Text>
          <Text style={styles.userEmail}>{userEmail || 'user@changwon.ac.kr'}</Text>
        </View>

        <View style={styles.bookmarkSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ 즐겨찾기 한 장소</Text>
            <TouchableOpacity onPress={() => onNavigate('Favorites')}>
              <Text style={styles.moreText}>더보기 ➔</Text>
            </TouchableOpacity>
          </View>
          
         {/* 🌟 기존 BOOKMARKED_PLACES 대신 myFavorites 사용 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {myFavorites.length > 0 ? (
            myFavorites.map((fav) => (
              <TouchableOpacity 
                key={fav._id} 
                style={styles.bookmarkCard} 
                onPress={() => onNavigate('NewRecommendation')}
              >
                <View style={styles.cardIconBox}>
    <Ionicons 
       name={getIconName(fav.placeId?.hashtags || [fav.placeId?.category])} 
       size={30} 
       color="#4A6741" 
    />
  </View>
                {/* 🌟 placeId가 객체일 경우를 대비해 처리 */}
                <Text style={styles.cardName} numberOfLines={1}>
                  {typeof fav.placeId === 'object' ? fav.placeId.name : '장소 정보 없음'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ padding: 10, color: '#888' }}>저장된 장소가 없습니다.</Text>
          )}
        </ScrollView>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('EditProfile')}>
            <Text style={styles.menuItemText}>👤 내 정보</Text>
            <Text style={styles.menuArrow}>➔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setIsGuideVisible(true)}>
            <Text style={styles.menuItemText}>ℹ️ 이용 안내</Text>
            <Text style={styles.menuArrow}>➔</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => onNavigate('Welcome')}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* 이용 안내 커스텀 팝업 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isGuideVisible}
        onRequestClose={() => setIsGuideVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>ℹ️ 이용 안내</Text>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                본 앱은 사용자의 취향, 위치, 예산 정보를 바탕으로 상황에 맞는 놀거리 장소를 추천하는 서비스입니다.{"\n"}{"\n"}
                AI 추천은 사용자가 선택한 선호 태그와 장소 정보를 비교하여 제공됩니다. 선호 태그를 자세히 설정할수록 더 적합한 추천 결과를 받을 수 있습니다.{"\n"}{"\n"}
                현재 위치 기반 추천을 위해 위치 정보가 사용될 수 있으며, 위치 정보는 장소 추천 목적으로만 활용됩니다.{"\n"}{"\n"}
                마음에 드는 장소는 즐겨찾기에 저장할 수 있고, 마이페이지에서 다시 확인할 수 있습니다.
              </Text>
              
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>
                  ※ 추천 결과의 운영 시간, 가격, 거리 정보는 실제와 다를 수 있으므로 방문 전 확인이 필요합니다.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsGuideVisible(false)}>
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F1F8F1', borderBottomWidth: 1, borderColor: '#b5c9b0' },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backButtonText: { fontSize: 16, color: '#4A6741', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A6741' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  profileSection: { alignItems: 'center', marginBottom: 28, marginTop: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 3, borderColor: '#fff', backgroundColor: '#e8f0e5', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  username: { fontSize: 20, fontWeight: 'bold', color: '#4A6741', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6B7F5E' },
  bookmarkSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A6741' },
  moreText: { fontSize: 13, color: '#4A6741', fontWeight: '600' },
  horizontalScroll: { paddingRight: 20 },
  bookmarkCard: { width: 130, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1, borderColor: '#b5c9b0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  cardIconBox: { 
  width: '100%',     // 카드 너비에 맞게 조정
  height: 80,        // 기존 이미지 높이와 동일하게
  backgroundColor: '#e8f0e5', 
  borderRadius: 8, 
  justifyContent: 'center', 
  alignItems: 'center', 
  marginBottom: 8 
},
  cardIcon: { fontSize: 22 },
  cardImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 8, backgroundColor: '#e8f0e5' },
  cardCategory: { fontSize: 11, color: '#4A6741', fontWeight: '700', marginBottom: 2 },
  cardName: { fontSize: 13, fontWeight: 'bold', color: '#4A6741' },
  menuGroup: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#b5c9b0', overflow: 'hidden', marginBottom: 28 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#e8f0e5' },
  menuItemText: { fontSize: 15, color: '#4A6741', fontWeight: '500' },
  menuArrow: { fontSize: 14, color: '#b5c9b0' },
  logoutButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#b5c9b0' },
  logoutButtonText: { color: '#ff3b30', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', maxHeight: '75%', backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A6741', marginBottom: 16, textAlign: 'center' },
  modalScroll: { marginBottom: 10 },
  modalText: { fontSize: 14, color: '#495057', lineHeight: 22, textAlign: 'left' },
  noticeBox: { backgroundColor: '#f5faf5', padding: 12, borderRadius: 8, marginTop: 14, borderWidth: 1, borderColor: '#b5c9b0' },
  noticeText: { fontSize: 12, color: '#4A6741', lineHeight: 18, fontWeight: '500' },
  modalCloseButton: { backgroundColor: '#4A6741', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  modalCloseButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});