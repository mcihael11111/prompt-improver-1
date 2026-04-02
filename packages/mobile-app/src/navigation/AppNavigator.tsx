import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { CoachScreen } from '../screens/CoachScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UpgradeScreen } from '../screens/UpgradeScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Coach" component={CoachScreen} />
      <HomeStack.Screen name="Results" component={ResultsScreen} />
    </HomeStack.Navigator>
  );
}

function SettingsStackScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <SettingsStack.Screen name="SettingsMain">
        {(props) => <SettingsScreen {...props} onSignOut={onSignOut} />}
      </SettingsStack.Screen>
      <SettingsStack.Screen name="Upgrade" component={UpgradeScreen} />
    </SettingsStack.Navigator>
  );
}

interface Props {
  onSignOut: () => void;
}

export function AppNavigator({ onSignOut }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.primaryLowest },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙</Text>,
        }}
      >
        {() => <SettingsStackScreen onSignOut={onSignOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
