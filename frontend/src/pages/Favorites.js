import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_FAVORITES = [
  {
    id: 1,
    title: '숲속 감성 카페 "모퉁이"',
    category: '카페',
    distance: '1.2 km',
    address: '창원시 의창구 사림동 12-3',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: '네온 레이싱 카트장',
    category: '액티비티',
    distance: '3.5 km',
    address: '창원시 성산구 상남동 45-1',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: '아날로그 레트로 오락실',
    category: '액티비티',
    distance: '0.8 km',
    address: '창원시 의창구 퇴촌동 7-2',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    title: '호숫가 대나무 숲길',
    category: '힐링',
    distance: '2.1 km',
    address: '창원시 의창구 용호동 88',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    title: '잔잔한 심야 책방',
    category: '카페',
    distance: '1.7 km',
    address: '창원시 성산구 중앙동 19',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&auto=format&fit=crop&q=60'
  }
];

const CATEGORIES = ['전체', '카페', '액티비티', '힐링'];

export default function FavoritesScreen({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);

  const handleRemoveFavorite = (id) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const filteredFavorites = favorites.filter(item => 
    selectedCategory === '전체' || item.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('MyProfile')}>
          <Text style={styles.backButtonText}>◁ 마이페이지</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>즐겨찾기 목록</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.tabBar}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.tabItem, selectedCategory === cat && styles.activeTabItem]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.tabText, selectedCategory === cat && styles.activeTabText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {filteredFavorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>즐겨찾기 한 장소가 없습니다. 🗺️</Text>
          </View>
        ) : (
          filteredFavorites.map((item) => (
            <View key={item.id} style={styles.favoriteCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                  <Text style={styles.distanceText}>{item.distance}</Text>
                </View>

                <Text style={styles.placeTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>{item.address}</Text>
              </View>

              <TouchableOpacity 
                style={styles.heartButton} 
                onPress={() => handleRemoveFavorite(item.id)}
              >
                <Text style={styles.heartIcon}>❤️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButton: { width: 100, paddingVertical: 8 },
  backButtonText: { fontSize: 15, color: '#868e96', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111', flex: 1, textAlign: 'center' },
  headerRightSpace: { width: 100 },
  
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f3f5' },
  tabItem: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: '#f1f3f5' },
  activeTabItem: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 13, color: '#495057', fontWeight: '500' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },

  scrollContainer: { padding: 16, paddingBottom: 30 },
  
  favoriteCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eef0f2', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 1 },
  cardImage: { width: 75, height: 75, borderRadius: 10, backgroundColor: '#eee' },
  cardContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  categoryBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  categoryBadgeText: { fontSize: 10, color: '#007AFF', fontWeight: 'bold' },
  distanceText: { fontSize: 11, fontWeight: '700', color: '#ff3b30' },
  placeTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  placeAddress: { fontSize: 12, color: '#868e96' },
  
  heartButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  heartIcon: { fontSize: 20 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 14, color: '#868e96', fontWeight: '500' }
});