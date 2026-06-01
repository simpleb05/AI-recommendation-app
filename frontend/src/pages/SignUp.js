import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

// 이름을 SignUpScreen으로 변경하고, 화면 이동용인 onNavigate 함수를 받아옵니다.
export default function SignUpScreen({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    // 1. 모든 항목 필수 입력 검사
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('알림', '모든 항목을 입력해 주세요.');
      return;
    }

    // 2. 이메일 형식 검사 (@와 도메인이 올바르게 들어갔는지 확인)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('오류', '올바른 이메일 형식(example@email.com)이 아닙니다.');
      return;
    }

    // 3. 비밀번호 일치 여부 검사
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 4. 확실한 가입 완료 팝업 노출 및 Welcome 화면으로 이동
    Alert.alert(
      '회원가입 완료', 
      `${name}님의 회원가입이 성공적으로 완료되었습니다!`,
      [
        {
          text: '확인',
          // 팝업의 확인 버튼을 누르면 자동으로 첫 선택 화면으로 돌아갑니다.
          onPress: () => onNavigate('Welcome')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} placeholder="이름을 입력하세요" value={name} onChangeText={setName} />
          
          <Text style={styles.label}>이메일 주소</Text>
          <TextInput style={styles.input} placeholder="이메일을 입력하세요" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          
          <Text style={styles.label}>비밀번호</Text>
          <TextInput style={styles.input} placeholder="비밀번호를 입력하세요" secureTextEntry={true} value={password} onChangeText={setPassword} />
          
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput style={styles.input} placeholder="비밀번호를 한 번 더 입력하세요" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>

        {/* 웰컴 화면으로 돌아가는 버튼 */}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('Welcome')}>
          <Text style={styles.backButtonText}>이전으로</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#111' },
  inputGroup: { marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  backButtonText: { color: '#666', fontSize: 16 },
});