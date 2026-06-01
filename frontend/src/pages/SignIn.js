import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function SignInScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인 화면</Text>
      <Text style={styles.info}>여기에 아이디와 비밀번호 입력창이 들어올 예정입니다.</Text>
      
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Welcome')}>
        <Text style={styles.backButtonText}>처음으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 14, color: '#666', marginBottom: 32 },
  backButton: { backgroundColor: '#efefef', padding: 12, borderRadius: 8 },
  backButtonText: { color: '#333', fontSize: 16 },
});