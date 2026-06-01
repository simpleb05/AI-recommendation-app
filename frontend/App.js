import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import WelcomeScreen from './src/pages/Welcome';
import SignInScreen from './src/pages/SignIn';
import SignUpScreen from './src/pages/SignUp';

export default function App() {
  // 현재 어떤 화면을 보여줄지 저장하는 상태 (기본값은 'Welcome')
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  // 조건부 렌더링으로 화면 제어하기
  const renderScreen = () => {
    if (currentScreen === 'Welcome') {
      return <WelcomeScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'Login') {
      return <SignInScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'SignUp') {
      return <SignUpScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* 현재 상태에 맞는 화면을 띄워줍니다 */}
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});