import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import LoginScreen from './src/pages/Login'; // 방금 만든 Login.js 불러오기

export default function App() {
  return (
    // SafeAreaView는 스마트폰의 상단 노치나 하단 바에 화면이 잘리지 않게 보호해 줍니다.
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* 화면에 회원가입 페이지 띄우기 */}
      <LoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});