import React, { useState, useEffect } from 'react'; // 1. useEffect 추가
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoritesScreen({ onNavigate }) {
  const [favorites, setFavorites] = useState([]); // 2. 초기값 빈 배열로 변경
  const [loading, setLoading] = useState(true);   // 로딩 상태 추가

  // 3. 서버에서 데이터를 가져오는 함수
  const fetchFavorites = async () => {
    try {

    const token = await AsyncStorage.getItem('userToken');
    console.log("현재 보낼 토큰 값:", token);

     const response = await fetch('http://10.0.2.2:5000/api/favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 👈 이 부분이 핵심입니다!
      }
    });
      const data = await response.json();
      console.log("서버에서 받아온 데이터:", data);
      if (data.success) {
        setFavorites(data.favorites || []); // 서버에서 받은 데이터 저장
      }
    } catch (error) {
      console.error("즐겨찾기 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(); // 컴포넌트가 처음 뜰 때 실행
  }, []);

  const handleRemoveFavorite = async (id) => {
    // 서버 삭제 요청 로직
    await fetch(`http://10.0.2.2:5000/api/favorites/${id}`, { method: 'DELETE' });
    setFavorites(prev => prev.filter(item => item._id !== id)); // _id로 비교
  };

  if (loading) return <ActivityIndicator style={{flex: 1}} size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('MyProfile')}>
          <Text style={styles.backButtonText}>◁ 마이페이지</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>즐겨찾기 목록</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
       {Array.isArray(favorites) && favorites.length === 0 ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>즐겨찾기 한 장소가 없습니다. 🗺️</Text>
    </View>
  ) : (
    // 데이터가 있을 때만 맵핑
    Array.isArray(favorites) && favorites.map((item) => (
      <TouchableOpacity 
        key={item._id || item.id} 
        style={styles.favoriteCard}
        onPress={() => onNavigate('PlaceDetail', { place: item })}
      >
        {/* 데이터가 안전하게 있을 때만 접근 */}
        <Image source={{ uri: item.placeId?.imageUrl }} style={styles.cardImage} />
        
        <View style={styles.cardContent}>
          <Text style={styles.placeTitle}>{item.placeId?.name || '제목 없음'}</Text>
          <Text style={styles.placeAddress}>{item.placeId?.address || '주소 없음'}</Text>
        </View>

        <TouchableOpacity onPress={() => handleRemoveFavorite(item._id)}>
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ))
  )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F1F8F1', borderBottomWidth: 1, borderColor: '#b5c9b0' },
  backButton: { width: 100, paddingVertical: 8 },
  backButtonText: { fontSize: 15, color: '#4A6741', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#4A6741', flex: 1, textAlign: 'center' },
  headerRightSpace: { width: 100 },
  scrollContainer: { padding: 16, paddingBottom: 30 },
  favoriteCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#b5c9b0', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 1 },
  cardImage: { width: 75, height: 75, borderRadius: 10, backgroundColor: '#e8f0e5' },
  cardContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  categoryBadge: { backgroundColor: '#e8f0e5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  categoryBadgeText: { fontSize: 10, color: '#4A6741', fontWeight: 'bold' },
  distanceText: { fontSize: 11, fontWeight: '700', color: '#4A6741' },
  placeTitle: { fontSize: 15, fontWeight: 'bold', color: '#4A6741', marginBottom: 2 },
  placeAddress: { fontSize: 12, color: '#6B7F5E' },
  heartButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  heartIcon: { fontSize: 20 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, color: '#6B7F5E', fontWeight: '500' }
});