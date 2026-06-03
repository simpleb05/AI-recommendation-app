import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function RecommendationMapScreen({ onNavigate, userToken }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [region, setRegion] = useState(null);
  const [initialLocation, setInitialLocation] = useState(null); // 원 중심 고정용
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const startPos = { latitude, longitude };
        
        setInitialLocation(startPos); // 고정된 중심점 저장
        setRegion({ ...startPos, latitudeDelta: 0.015, longitudeDelta: 0.015 });
      } else {
        const startPos = { latitude: 35.2278, longitude: 128.6817 };
        setInitialLocation(startPos);
        setRegion({ ...startPos, latitudeDelta: 0.05, longitudeDelta: 0.05 });
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

  // 지도 이동 제한 로직
  const onRegionChange = (newRegion) => {
    if (!initialLocation) return;
    
    // radius(미터)를 km로 바꾸고, 거기에 1.5배 정도 여유를 준 값을 LIMIT으로 사용
    const km = radius / 1000;
    const LIMIT = km * 0.015; // 반경에 비례해서 이동 범위를 제한함

    if (Math.abs(newRegion.latitude - initialLocation.latitude) > LIMIT ||
        Math.abs(newRegion.longitude - initialLocation.longitude) > LIMIT) {
        
        mapRef.current?.animateToRegion({
            ...initialLocation,
            latitudeDelta: km * 0.02, // 줌 레벨도 반경에 맞춰 부드럽게 조정
            longitudeDelta: km * 0.02,
        }, 500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <Text style={styles.backButtonText}>◁ 홈으로</Text>
        </TouchableOpacity>
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
        {loading || !region ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={onRegionChange}
            showsUserLocation={true}
            toolbarEnabled={false}
          >
            {initialLocation && (
              <Circle
                center={initialLocation} // 고정된 중심
                radius={radius}
                strokeColor="rgba(0, 122, 255, 0.5)"
                fillColor="rgba(0, 122, 255, 0.2)"
              />
            )}
            {places.map((place) => (
              <Marker
                key={place._id}
                coordinate={{ latitude: parseFloat(place.latitude), longitude: parseFloat(place.longitude) }}
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
  emptyText: { fontSize: 13, color: '#888' },
  radiusControl: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: '#fff' },
  radiusButton: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeButton: { backgroundColor: '#007AFF' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  inactiveText: { color: '#333' }
});