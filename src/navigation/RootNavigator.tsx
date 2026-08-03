import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { OnboardingNameScreen } from '../screens/OnboardingNameScreen';
import { OnboardingCycleScreen } from '../screens/OnboardingCycleScreen';
import { OnboardingDataScreen } from '../screens/OnboardingDataScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { DayDetailScreen } from '../screens/DayDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, account, cycleProfile } = useApp();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const isOnboarded = !!cycleProfile?.onboarding_completed;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!account ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : !isOnboarded ? (
        <>
          <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
          <Stack.Screen name="OnboardingCycle" component={OnboardingCycleScreen} />
          <Stack.Screen name="OnboardingData" component={OnboardingDataScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="DayDetail" component={DayDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
