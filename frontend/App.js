import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 📂 image_ff679a.png 구조에 맞춘 올바른 컴포넌트 임포트
import WelcomeScreen from './src/pages/Welcome';
import SignInScreen from './src/pages/SignIn';
import SignUpScreen from './src/pages/SignUp';
import PreferencesScreen from './src/pages/Preferences';
import HomeScreen from './src/pages/Home';
import TodayMoodScreen from './src/pages/TodayMoodScreen';

export default function App() {
  // 1. 첫 시작 화면은 'Welcome'으로 설정합니다.
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  // 화면 전환을 담당하는 내비게이션 함수
  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        {/* [1] 웰컴 화면 (Welcome.js) */}
        {currentScreen === 'Welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {/* [2] 로그인 화면 (SignIn.js) */}
        {currentScreen === 'SignIn' && (
          <SignInScreen onNavigate={handleNavigate} />
        )}

        {/* [3] 회원가입 화면 (SignUp.js) */}
        {currentScreen === 'SignUp' && (
          <SignUpScreen onNavigate={handleNavigate} />
        )}

        {/* [4] 최초 전체 취향 설문 화면 (Preferences.js) */}
        {currentScreen === 'Preferences' && (
          <PreferencesScreen onNavigate={handleNavigate} />
        )}

        {/* [5] 메인 홈 화면 (Home.js) */}
        {currentScreen === 'Home' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}

        {/* [6] 오늘의 무드 설정 화면 (TodayMoodScreen.js) */}
        {currentScreen === 'TodayMood' && (
          <TodayMoodScreen onNavigate={handleNavigate} />
        )}

      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});