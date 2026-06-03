import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

// 💡 App.js로부터 넘어오는 `isNewUser`와 `setIsNewUser` props를 확실하게 받습니다!
export default function SignInScreen({ onNavigate, isNewUser, setIsNewUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true); // 비밀번호 숨김 상태 관리

  const handleSignIn = async () => {
    // 1. 빈 칸 검사
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // 2. 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      // 3. 백엔드 로그인 API 호출 (안드로이드 에뮬레이터 주소)
      const response = await fetch('http://10.0.2.2:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      // 4. 서버 응답 결과에 따른 처리
      if (response.ok && data.success) {
        // 로그인 성공! 
        // 💡 중요: data.token과 data.nickname이 들어있습니다. 
        Alert.alert('성공', `${data.nickname}님, 환영합니다!`);

        // 5. 💡 [방법 2: 프론트엔드 자체 스위치 기반 분기 로직 적용]
        if (isNewUser) {
          // 방금 회원가입 화면에서 가입 성공하고 넘어온 완전 새내기 유저라면?
          setIsNewUser(false); // 1회성 스위치이므로 다음 로그인을 위해 다시 false로 꺼줍니다!
          onNavigate('Preferences'); // 취향 조사 화면으로 즉시 이동
        } else {
          // 평소에 로그인해서 들어오는 기존 유저라면?
          onNavigate('Home'); // 취향 조사 없이 메인 홈 화면으로 직행!
        }

      } else {
        // 서버에서 실패 응답을 보낸 경우 (비밀번호 틀림 등)
        Alert.alert('로그인 실패', data.message || '이메일 또는 비밀번호를 확인해 주세요.');
      }

    } catch (error) {
      // 서버 자체가 꺼져있거나 네트워크 연결이 끊긴 경우
      console.error('로그인 서버 통신 에러:', error);
      Alert.alert('에러', '서버와 연결할 수 없습니다. 백엔드가 켜져 있는지 확인해 주세요.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 상단 타이틀 구역 */}
        <View style={styles.headerGroup}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>서비스를 이용하기 위해 로그인해 주세요.</Text>
        </View>

        {/* 입력창 구역 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일 주소</Text>
          <TextInput 
            style={styles.input} 
            placeholder="example@email.com" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={setEmail} 
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>비밀번호</Text>
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              <Text style={styles.toggleText}>{secureTextEntry ? '비밀번호 표시' : '비밀번호 숨기기'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호를 입력하세요" 
            secureTextEntry={secureTextEntry} 
            value={password} 
            onChangeText={setPassword} 
          />
        </View>

        {/* 로그인 버튼 */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
          <Text style={styles.loginButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* 처음으로 가기 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Welcome')}>
          <Text style={styles.backButtonText}>처음으로 돌아가기</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  headerGroup: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666' },
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#444' },
  toggleText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  loginButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  backButtonText: { color: '#666', fontSize: 16 },
});