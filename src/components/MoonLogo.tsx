import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function MoonLogo({ size = 76 }: { size?: number }) {
  const dotSize = size * 0.4;
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderWidth: size * 0.05 },
      ]}
    >
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
  },
  dot: {
    backgroundColor: colors.primary,
  },
});
