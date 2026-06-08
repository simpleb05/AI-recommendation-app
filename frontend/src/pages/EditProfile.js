import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen({ onNavigate, userToken, userNickname, setUserNickname }) {
  const [username, setUsername] = useState(userNickname || '사용자님');
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/user/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setUsername(data.user.nickname);
          setUserEmail(data.user.email);
        }
      } catch (error) {
        console.error('프로필 불러오기 실패:', error);
      }
    };

    if (userToken) fetchProfile();
  }, [userToken]);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('경고', '이름을 입력해 주세요.');
      return;
    }

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        Alert.alert('경고', '현재 비밀번호를 입력해야 변경이 가능합니다.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('경고', '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    try {
      // 닉네임 변경
      if (username !== userNickname) {
        const nicknameRes = await fetch('http://10.0.2.2:5000/api/user/nickname', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ nickname: username }),
        });
        const nicknameData = await nicknameRes.json();
        if (!nicknameData.success) {
          Alert.alert('오류', nicknameData.message);
          return;
        }
        setUserNickname(username);
      }

      // 비밀번호 변경
      if (currentPassword && newPassword) {
        const passwordRes = await fetch('http://10.0.2.2:5000/api/user/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const passwordData = await passwordRes.json();
        if (!passwordData.success) {
          Alert.alert('오류', passwordData.message);
          return;
        }
      }

      Alert.alert('성공', '회원 정보가 성공적으로 수정되었습니다.', [
        { text: '확인', onPress: () => onNavigate('MyProfile') }
      ]);
    } catch (error) {
      Alert.alert('오류', '서버 연결에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('MyProfile')}>
          <Text style={styles.backButtonText}>◁ 취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 정보 수정</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>이름</Text>
          <TextInput 
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="이름을 입력하세요"
          />

          <Text style={styles.inputLabel}>이메일 (변경 불가)</Text>
          <TextInput 
            style={[styles.input, styles.disabledInput]}
            value={userEmail}
            editable={false}
          />

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>현재 비밀번호</Text>
          <TextInput 
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="기존 비밀번호 입력"
            secureTextEntry
          />

          <Text style={styles.inputLabel}>새 비밀번호</Text>
          <TextInput 
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="새 비밀번호 입력"
            secureTextEntry
          />

          <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
          <TextInput 
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="새 비밀번호 재입력"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>변경사항 저장하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#F1F8F1', borderBottomWidth: 1, borderColor: '#b5c9b0' },
  backButton: { width: 60, paddingVertical: 8 }, 
  backButtonText: { fontSize: 16, color: '#4A6741', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A6741', flex: 1, textAlign: 'center' }, 
  headerRightSpace: { width: 60 }, 
  scrollContainer: { padding: 20 },
  formSection: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#b5c9b0', marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#4A6741', marginBottom: 6, paddingLeft: 2 },
  input: { height: 44, backgroundColor: '#f5faf5', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#b5c9b0' },
  disabledInput: { backgroundColor: '#e8f0e5', color: '#6B7F5E', borderColor: '#b5c9b0' },
  divider: { height: 1, backgroundColor: '#b5c9b0', marginVertical: 10, marginBottom: 18 },
  saveButton: { backgroundColor: '#4A6741', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#4A6741', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});