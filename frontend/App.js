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
  const [userToken, setUserToken] = useState(null); 
  const [userNickname, setUserNickname] = useState('사용자');
  const [userEmail, setUserEmail] = useState('user@changwon.ac.kr');

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
  };

  // 🔑 [수정 완료] 이제 매개변수에서 token, nickname과 함께 'email'도 누락 없이 완벽히 받아옵니다!
  const handleSignInSuccess = (token, nickname, email) => {
    try {
      if (token) setUserToken(token);
      if (nickname) setUserNickname(nickname); 
      if (email) setUserEmail(email); // 👈 이제 email 변수가 명확히 존재하므로 에러가 나지 않습니다!
    } catch (error) {
      console.error("App.js 상태 저장 중 에러:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        
        {currentScreen === 'Welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {/* 🌟 SignInScreen 호출부: 인자 3개를 매칭하여 handleSignInSuccess로 안전하게 보냅니다. */}
        {currentScreen === 'SignIn' && (
          <SignInScreen 
            onNavigate={handleNavigate} 
            isNewUser={isNewUser} 
            setIsNewUser={setIsNewUser} 
            onSignInSuccess={(token, nickname, email) => handleSignInSuccess(token, nickname, email)}
          />
        )}

        {currentScreen === 'SignUp' && (
          <SignUpScreen 
            onNavigate={handleNavigate} 
            setIsNewUser={setIsNewUser} 
          />
        )}

        {/* 취향 조사 화면에 userToken 배달 */}
        {currentScreen === 'Preferences' && (
          <PreferencesScreen 
            onNavigate={handleNavigate} 
            userToken={userToken} 
          />
        )}

        {/* 메인 홈 화면에 userToken과 진짜 유저 닉네임 배달 */}
        {currentScreen === 'Home' && (
          <HomeScreen 
            onNavigate={handleNavigate} 
            userToken={userToken} 
            userNickname={userNickname} // 👈 홈 화면 이름 안 바뀌던 문제 해결!
          />
        )}

        {currentScreen === 'TodayMood' && (
          <TodayMoodScreen 
            onNavigate={handleNavigate}
            userToken={userToken}
          />
        )}

        {currentScreen === 'NewRecommendation' && (
          <RecommendationMapScreen onNavigate={handleNavigate} 
          userToken={userToken}
          />
        )}

        {/* 마이 프로필 화면에 진짜 유저 닉네임과 이메일 배달 */}
        {currentScreen === 'MyProfile' && (
          <MyProfileScreen 
            onNavigate={handleNavigate} 
            userNickname={userNickname} // 👈 마이페이지 이름 연동!
            userEmail={userEmail}       // 👈 마이페이지 이메일 연동!
            userToken={userToken}
          />
        )}

        {currentScreen === 'EditProfile' && (
          <EditProfileScreen 
            onNavigate={handleNavigate} 
            userToken={userToken}
            userNickname={userNickname}
            setUserNickname={setUserNickname}
          />
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