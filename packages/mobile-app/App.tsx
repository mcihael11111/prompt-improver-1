import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { getSession } from './src/services/storage';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const session = await getSession();
    setIsSignedIn(!!session?.userId);
  }

  if (isSignedIn === null) return null; // Loading

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isSignedIn ? (
        <AppNavigator onSignOut={() => setIsSignedIn(false)} />
      ) : (
        <AuthNavigator onSignIn={() => setIsSignedIn(true)} />
      )}
    </NavigationContainer>
  );
}
