import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EditProfileScreen from './src/pages/EditProfile'; 
import WelcomeScreen from './src/pages/Welcome';
import SignInScreen from './src/pages/SignIn';
import SignUpScreen from './src/pages/SignUp';
import PreferencesScreen from './src/pages/Preferences';
import HomeScreen from './src/pages/Home';
import TodayMoodScreen from './src/pages/TodayMoodScreen';
import RecommendationMapScreen from './src/pages/RecommendationMap';
import MyProfileScreen from './src/pages/MyProfile'; 
import FavoritesScreen from './src/pages/Favorites';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [isNewUser, setIsNewUser] = useState(false); // 💡 새 유저 판단 스위치 상태 유지

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        {currentScreen === 'Welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {/* 🌟 [수정] SignInScreen에 스위치 상태와 스위치를 끄는 함수를 전달합니다. */}
        {currentScreen === 'SignIn' && (
          <SignInScreen 
            onNavigate={handleNavigate} 
            isNewUser={isNewUser} 
            setIsNewUser={setIsNewUser} 
          />
        )}

        {/* 🌟 [수정] SignUpScreen에 스위치를 켜는 함수를 전달합니다. */}
        {currentScreen === 'SignUp' && (
          <SignUpScreen 
            onNavigate={handleNavigate} 
            setIsNewUser={setIsNewUser} 
          />
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

        {currentScreen === 'NewRecommendation' && (
          <RecommendationMapScreen onNavigate={handleNavigate} />
        )}

        {/* 👤 [마이 프로필 화면 분기 조건식] */}
        {currentScreen === 'MyProfile' && (
          <MyProfileScreen onNavigate={handleNavigate} />
        )}

        {/* ✍️ [내 정보 수정 화면 분기 조건식] */}
        {currentScreen === 'EditProfile' && (
          <EditProfileScreen onNavigate={handleNavigate} />
        )}

        {/* ⭐ [즐겨찾기 목록 화면 분기 조건식 추가!] */}
        {currentScreen === 'Favorites' && (
          <FavoritesScreen onNavigate={handleNavigate} />
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