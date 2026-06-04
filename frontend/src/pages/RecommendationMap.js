import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

// 1. 거리 계산 함수 (두 지점 사이의 미터 단위 거리)
const getDistance = (coord1, coord2) => {
  const R = 6371e3;
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function RecommendationMapScreen({ onNavigate, userToken }) {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]); // 필터링된 장소들
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [region, setRegion] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      const startPos = status === 'granted' 
        ? (await Location.getCurrentPositionAsync({})).coords 
        : { latitude: 35.2278, longitude: 128.6817 };
      
      setInitialLocation({ latitude: startPos.latitude, longitude: startPos.longitude });
      setRegion({ ...startPos, latitudeDelta: 0.015, longitudeDelta: 0.015 });
    })();

    const fetchPlaces = async () => {
      console.log("전송할 토큰:", userToken);
      try {
        const response = await fetch('http://10.0.2.2:5000/api/places', {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await response.json();
        console.log("서버가 보내준 데이터 구조:", data);

        if (data.success) {
          setPlaces(data.places);
          setFilteredPlaces(data.places);}
        } catch (error) {
        console.error('데이터 통신 에러:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // 2. 반경이 바뀔 때마다 장소 필터링
  useEffect(() => {
    if (initialLocation && places.length > 0) {
      const filtered = places.filter((place) => {
        const dist = getDistance(initialLocation, { 
          latitude: parseFloat(place.latitude), 
          longitude: parseFloat(place.longitude) 
        });
        return dist <= radius;
      });
      setFilteredPlaces(filtered);
    }
  }, [radius, places, initialLocation]);

  const onRegionChange = (newRegion) => {
    if (!initialLocation) return;
    const km = radius / 1000;
    const LIMIT = km * 0.02;
    if (Math.abs(newRegion.latitude - initialLocation.latitude) > LIMIT ||
        Math.abs(newRegion.longitude - initialLocation.longitude) > LIMIT) {
        mapRef.current?.animateToRegion({
            ...initialLocation,
            latitudeDelta: km * 0.02,
            longitudeDelta: km * 0.02,
        }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}><Text style={styles.backButtonText}>◁ 홈으로</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>주변 장소 추천</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.radiusControl}>
        {[1, 3, 5].map((km) => (
          <TouchableOpacity 
            key={km} 
            style={[styles.radiusButton, radius === km * 1000 && styles.activeButton]} 
            onPress={() => setRadius(km * 1000)}
          >
            <Text style={radius === km * 1000 ? styles.activeText : styles.inactiveText}>{km}km</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mapContainer}>
  {/* 데이터는 왔는데 위치가 안 잡혀서 로딩이 안 끝나는 경우를 방지 */}
  {loading ? (
    <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
  ) : (
    <MapView 
      ref={mapRef} 
      style={styles.map} 
      initialRegion={{
        latitude: initialLocation?.latitude || 35.2278,
        longitude: initialLocation?.longitude || 128.6817,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }}
      showsUserLocation={true}
    >
      {initialLocation && (
        <Circle 
          center={initialLocation} 
          radius={radius} 
          strokeColor="rgba(0, 122, 255, 0.5)" 
          fillColor="rgba(0, 122, 255, 0.2)" 
        />
      )}
      {filteredPlaces.map((place) => (
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
            <View style={styles.divider} /><Text style={styles.descContent}>{selectedPlace.description}</Text>
          </ScrollView>
        ) : <View style={styles.emptyContainer}><Text style={styles.emptyText}>핀을 선택해 상세 정보를 확인하세요.</Text></View>}
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
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  descContent: { fontSize: 14, color: '#333' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#888' },
  radiusControl: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#fff' },
  radiusButton: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeButton: { backgroundColor: '#007AFF' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  inactiveText: { color: '#333' }
});