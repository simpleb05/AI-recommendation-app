import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function LoginScreen() {
  // 사용자가 입력한 값을 실시간으로 저장하는 방(State)입니다.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // '다음' 버튼을 누르면 실행되는 함수
  const handleSignUp = () => {
    // 1. 빈칸이 있는지 확인
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('알림', '모든 항목을 입력해 주세요.');
      return;
    }
    // 2. 비밀번호가 둘이 똑같은지 확인
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 조건이 다 맞으면 팝업을 띄웁니다 (나중에 백엔드 서버랑 연결할 곳)
    Alert.alert('성공', `${name}님, 회원가입 양식이 확인되었습니다!`);
  };

  return (
    // KeyboardAvoidingView는 스마트폰 키보드가 올라올 때 입력창이 가려지지 않게 밀어주는 역할을 합니다.
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* 타이틀 */}
        <Text style={styles.title}>회원가입</Text>

        {/* 입력창 그룹 */}
        <View style={styles.inputGroup}>
          
          <Text style={styles.label}>이름</Text>
          <TextInput 
            style={styles.input} 
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName} // 타자를 칠 때마다 name 변수에 글자가 저장됨
          />

          <Text style={styles.label}>이메일 주소</Text>
          <TextInput 
            style={styles.input} 
            placeholder="이메일을 입력하세요"
            keyboardType="email-address" // 골뱅이(@)가 있는 이메일 자판 띄우기
            autoCapitalize="none"        // 첫 글자 영어 대문자 자동 변환 끄기
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호를 입력하세요"
            secureTextEntry={true}       // 비밀번호 동그라미(●)로 숨기기
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput 
            style={styles.input} 
            placeholder="비밀번호를 한 번 더 입력하세요"
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
        </View>

        {/* 설계 문서상의 '다음' 버튼 */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 스마트폰 화면에 예쁘게 보이도록 디자인(Style)을 입히는 공간입니다.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#111',
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});