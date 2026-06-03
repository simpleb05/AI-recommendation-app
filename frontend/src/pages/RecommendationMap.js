import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RecommendationMapScreen({ onNavigate, userToken }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // 1. region 상태 관리 (초기값 설정)
  const [region, setRegion] = useState(null); 
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        // 2. 내 위치를 받으면 region 업데이트
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      } else {
        // 권한 없을 시 기본 창원 위치로 설정
        setRegion({
          latitude: 35.2278,
          longitude: 128.6817,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();

    const fetchPlaces = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/places', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await response.json();
        if (data.success) setPlaces(data.places);
      } catch (error) {
        console.error('데이터 통신 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 홈으로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주변 장소 추천</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.mapContainer}>
        {/* 3. region 데이터가 준비될 때까지 로딩 표시 */}
        {loading || !region ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={(r) => setRegion(r)}
            showsUserLocation={true}
            toolbarEnabled={false}
          >
            {places.map((place) => (
              <Marker
                key={place._id}
                coordinate={{ 
                  latitude: parseFloat(place.latitude), 
                  longitude: parseFloat(place.longitude) 
                }}
                title={place.name}
                onPress={() => setSelectedPlace(place)}
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.detailCard}>
        {selectedPlace ? (
          <ScrollView>
            <Text style={styles.placeName}>{selectedPlace.name} ✨</Text>
            <Text style={styles.addressText}>📍 {selectedPlace.address}</Text>
            <Text style={styles.infoText}>💰 {selectedPlace.priceRange}</Text>
            <Text style={styles.infoText}>⏰ {selectedPlace.openingHours}</Text>
            <View style={styles.divider} />
            <Text style={styles.descContent}>{selectedPlace.description}</Text>
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>핀을 선택해 상세 정보를 확인하세요.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  detailCard: { height: 330, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 10 },
  placeName: { fontSize: 18, fontWeight: 'bold' },
  addressText: { fontSize: 13, color: '#666' },
  infoText: { fontSize: 13, color: '#444' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  descContent: { fontSize: 14, color: '#333' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#888' }
});