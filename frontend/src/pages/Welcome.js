import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>AI 추천 앱</Text>
        <Text style={styles.subtitle}>당신을 위한 맞춤형 서비스를 시작해보세요</Text>
      </View>

      <View style={styles.buttonGroup}>
        {/* 로그인 버튼을 누르면 부모 컴포넌트에 'Login' 상태를 전달 */}
        <TouchableOpacity style={styles.loginButton} onPress={() => onNavigate('Login')}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* 회원가입 버튼을 누르면 부모 컴포넌트에 'SignUp' 상태를 전달 */}
        <TouchableOpacity style={styles.signUpButton} onPress={() => onNavigate('SignUp')}>
          <Text style={styles.signUpButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'space-between' },
  textGroup: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  buttonGroup: { marginBottom: 40 },
  loginButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  signUpButton: { backgroundColor: '#fff', paddingVertical: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF' },
  signUpButtonText: { color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
});