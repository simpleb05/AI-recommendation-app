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
  const [isNewUser, setIsNewUser] = useState(false); 
  // 🔑 [추가] 전역으로 유저 토큰을 관리할 상태 선언!
  const [userToken, setUserToken] = useState(null); 

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  // 🔑 [추가] 로그인 성공 시 토큰을 App.js에 안전하게 보관하는 함수
  const handleSignInSuccess = (token) => {
    setUserToken(token);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        {currentScreen === 'Welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {/* 🌟 [수정] onSignInSuccess 콜백을 연결해서 로그인 시 토큰을 가로챕니다! */}
        {currentScreen === 'SignIn' && (
          <SignInScreen 
            onNavigate={handleNavigate} 
            isNewUser={isNewUser} 
            setIsNewUser={setIsNewUser} 
            onSignInSuccess={handleSignInSuccess} // 🔑 여기에 꽂아줍니다!
          />
        )}

        {currentScreen === 'SignUp' && (
          <SignUpScreen 
            onNavigate={handleNavigate} 
            setIsNewUser={setIsNewUser} 
          />
        )}

        {/* 🌟 [수정] 취향 조사 화면에도 인증을 보낼 수 있게 userToken을 배달합니다! */}
        {currentScreen === 'Preferences' && (
          <PreferencesScreen 
            onNavigate={handleNavigate} 
            userToken={userToken} // 🔑 PreferencesScreen에서도 이 토큰이 전달되도록 수정해야 해!
          />
        )}

        {currentScreen === 'Home' && (
          <HomeScreen 
            onNavigate={handleNavigate} 
            userToken={userToken} // 🔑 홈 화면으로 안전하게 배달 완료!
          />
        )}

        {currentScreen === 'TodayMood' && (
          <TodayMoodScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'NewRecommendation' && (
          <RecommendationMapScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'MyProfile' && (
          <MyProfileScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'EditProfile' && (
          <EditProfileScreen onNavigate={handleNavigate} />
        )}

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