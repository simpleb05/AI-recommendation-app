import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
];

export default function EditProfileScreen({ onNavigate }) {
  const [username, setUsername] = useState('사용자님');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  const handleSave = () => {
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

    Alert.alert('성공', '회원 정보가 성공적으로 수정되었습니다.', [
      { text: '확인', onPress: () => onNavigate('MyProfile') }
    ]);
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
        
        <View style={styles.avatarSection}>
          <Image source={{ uri: selectedAvatar }} style={styles.currentAvatar} />
          <Text style={styles.sectionLabel}>프로필 이미지 선택</Text>
          <View style={styles.avatarList}>
            {AVATAR_OPTIONS.map((url, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setSelectedAvatar(url)}
                style={[
                  styles.avatarWrapper, 
                  selectedAvatar === url && styles.selectedAvatarWrapper
                ]}
              >
                <Image source={{ uri: url }} style={styles.subAvatar} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
            value="user@changwon.ac.kr"
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backButton: { width: 60, paddingVertical: 8 }, 
  backButtonText: { fontSize: 16, color: '#868e96', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', flex: 1, textAlign: 'center' }, 
  headerRightSpace: { width: 60 }, 
  scrollContainer: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24, backgroundColor: '#fff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#eee' },
  currentAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 2, borderColor: '#007AFF' },
  sectionLabel: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 10 },
  avatarList: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  avatarWrapper: { padding: 3, borderWidth: 2, borderColor: 'transparent', borderRadius: 30, marginHorizontal: 4 },
  selectedAvatarWrapper: { borderColor: '#007AFF' },
  subAvatar: { width: 46, height: 46, borderRadius: 23 },
  formSection: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#495057', marginBottom: 6, paddingLeft: 2 },
  input: { height: 44, backgroundColor: '#f1f3f5', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#333', marginBottom: 16, borderWidth: 1, borderColor: '#e9ecef' },
  disabledInput: { backgroundColor: '#e9ecef', color: '#868e96', borderColor: '#dee2e6' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10, marginBottom: 18 },
  saveButton: { backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});