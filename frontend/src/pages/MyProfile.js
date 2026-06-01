import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BOOKMARKED_PLACES = [
  { id: 1, name: '숲속 감성 카페 "모퉁이"', category: '카페', img: '☕' },
  { id: 2, name: '성수 가든 카페', category: '카페', img: '🌿' },
  { id: 3, name: '아날로그 레트로 오락실', category: '오락실', img: '🕹️' },
];

export default function MyProfileScreen({ onNavigate }) {
  
  const handleMenuPress = (menuName) => {
    Alert.alert('안내', `${menuName} 기능은 추후 백엔드 연동 시 활성화됩니다.`);
  };

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
          <Text style={styles.username}>사용자님 ✨</Text>
          <Text style={styles.userEmail}>user@changwon.ac.kr</Text>
        </View>

        {/* 💡 [수정 포인트] 별(⭐) 대신 하트(❤️) 이모티콘으로 전면 교체 */}
        <View style={styles.bookmarkSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ 즐겨찾기 한 장소</Text>
            <TouchableOpacity onPress={() => handleMenuPress('즐겨찾기 더보기')}>
              <Text style={styles.moreText}>더보기 ➔</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {BOOKMARKED_PLACES.map((place) => (
              <TouchableOpacity key={place.id} style={styles.bookmarkCard} onPress={() => onNavigate('NewRecommendation')}>
                <View style={styles.cardIconBox}>
                  <Text style={styles.cardIcon}>{place.img}</Text>
                </View>
                <Text style={styles.cardCategory}>{place.category}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.menuGroup}>
          {/* 👤 내 정보 버튼을 누르면 EditProfile 화면으로 라우팅되도록 수정 */}
            <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('EditProfile')}>
            <Text style={styles.menuItemText}>👤 내 정보</Text>
            <Text style={styles.menuArrow}>➔</Text>
            </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('이용 안내')}>
            <Text style={styles.menuItemText}>ℹ️ 이용 안내</Text>
            <Text style={styles.menuArrow}>➔</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => onNavigate('Welcome')}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButton: { paddingVertical: 8, paddingHorizontal: 4 },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  profileSection: { alignItems: 'center', marginBottom: 28, marginTop: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, borderWidth: 3, borderColor: '#fff', backgroundColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  username: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#888' },
  bookmarkSection: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  moreText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  horizontalScroll: { paddingRight: 20 },
  bookmarkCard: { width: 130, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
  cardIconBox: { width: 44, height: 44, backgroundColor: '#f1f3f5', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardIcon: { fontSize: 22 },
  cardCategory: { fontSize: 11, color: '#007AFF', fontWeight: '700', marginBottom: 2 },
  cardName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  menuGroup: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#eee', overflow: 'hidden', marginBottom: 28 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  menuItemText: { fontSize: 15, color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: 14, color: '#ccc' },
  logoutButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  logoutButtonText: { color: '#ff3b30', fontSize: 15, fontWeight: 'bold' },
});