import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

export default function SignInScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true); // 비밀번호 숨김 상태 관리

  const handleSignIn = () => {
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

    // 3. 💡 [시연용 분기 로직 적용] 중복 코드 정리 완료!
    // 발표할 때 이메일 입력창에 new@test.com 을 치면 신규 회원 흐름을 보여줄 수 있습니다.
    if (email === 'new@test.com') {
      Alert.alert('로그인 성공', '신규 회원 시나리오로 진입하여 취향 조사 페이지로 이동합니다.', [
        {
          text: '확인',
          onPress: () => onNavigate('Preferences') // 취향 조사 화면(Preferences.js)으로 이동
        }
      ]);
    } else {
      // 그 외의 아무 이메일이나 치면 기존 회원으로 간주하여 바로 메인 홈으로 이동합니다.
      onNavigate('Home'); // 메인 홈 화면(Home.js)으로 이동
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