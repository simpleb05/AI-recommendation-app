import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>AI 놀거리 추천 앱</Text>
        <Image 
          source={require('../../assets/bear.png')} 
          style={styles.bearImage}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>당신을 위한 맞춤형 서비스를 시작해보세요</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.loginButton} onPress={() => onNavigate('SignIn')}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={() => onNavigate('SignUp')}>
          <Text style={styles.signUpButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1', padding: 24, justifyContent: 'space-between' },
  textGroup: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  bearImage: {width: '70%',height: undefined, aspectRatio: 1, transform: [{ scale: 1.15 }], marginBottom: 24,},
  title: { fontSize: 32, fontWeight: 'bold', color: '#4A6741', marginBottom: 40 },
  subtitle: { fontSize: 16, color: '#6B7F5E', textAlign: 'center' },
  buttonGroup: { marginBottom: 40 },
  loginButton: { backgroundColor: '#4A6741', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signUpButton: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#4A6741' },
  signUpButtonText: { color: '#4A6741', fontSize: 18, fontWeight: 'bold' },
});