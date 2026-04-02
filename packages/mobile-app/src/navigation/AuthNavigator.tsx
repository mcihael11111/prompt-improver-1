import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SignInScreen } from '../screens/SignInScreen';

const Stack = createNativeStackNavigator();

interface Props {
  onSignIn: () => void;
}

export function AuthNavigator({ onSignIn }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn">
        {(props) => <SignInScreen {...props} onSignIn={onSignIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
