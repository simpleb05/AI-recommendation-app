import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import WelcomeScreen from './src/pages/Welcome';
import SignInScreen from './src/pages/SignIn';
import SignUpScreen from './src/pages/SignUp';
import PreferencesScreen from './src/pages/Preferences';
import HomeScreen from './src/pages/Home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const renderScreen = () => {
    if (currentScreen === 'Welcome') {
      return <WelcomeScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'Login') {
      return <SignInScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'SignUp') {
      return <SignUpScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'Preferences') {
      return <PreferencesScreen onNavigate={setCurrentScreen} />;
    } else if (currentScreen === 'Home') {
      return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});