import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type GradientScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  flat?: boolean;
}>;

export function GradientScreen({ children, style, flat }: GradientScreenProps) {
  if (flat) {
    return (
      <SafeAreaView style={[styles.flat, style]} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      locations={[0, 0.55]}
      style={styles.gradient}
    >
      <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flat: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
