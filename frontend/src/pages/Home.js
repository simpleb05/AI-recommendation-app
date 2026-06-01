import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 메인 화면 (놀거리 추천 결과)</Text>
      <Text style={styles.subtitle}>여기에 AI가 분석한 개인 맞춤형 놀거리 정보들이 멋지게 리스트로 출력될 예정입니다!</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={() => onNavigate('Welcome')}>
        <Text style={styles.logoutButtonText}>로그아웃 (처음으로)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40, lineHeight: 20 },
  logoutButton: { backgroundColor: '#ff3b30', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});