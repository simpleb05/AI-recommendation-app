import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 컴포넌트 임포트 구역
import WelcomeScreen from './src/pages/Welcome';
import SignInScreen from './src/pages/SignIn';
import SignUpScreen from './src/pages/SignUp';
import PreferencesScreen from './src/pages/Preferences';
import HomeScreen from './src/pages/Home';
import TodayMoodScreen from './src/pages/TodayMoodScreen';
import RecommendationMapScreen from './src/pages/RecommendationMap'; // 👈 [추가 완료!]

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        {currentScreen === 'Welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'SignIn' && (
          <SignInScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'SignUp' && (
          <SignUpScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'Preferences' && (
          <PreferencesScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'Home' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'TodayMood' && (
          <TodayMoodScreen onNavigate={handleNavigate} />
        )}

        {/* 🗺️ [추가 완료] 새 장소 추천받기 (지도 화면 진입 분기) */}
        {currentScreen === 'NewRecommendation' && (
          <RecommendationMapScreen onNavigate={handleNavigate} />
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