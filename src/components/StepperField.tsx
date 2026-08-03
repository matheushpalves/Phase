import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';

type StepperFieldProps = {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
};

export function StepperField({ label, value, minimumValue, maximumValue, onValueChange }: StepperFieldProps) {
  function decrement() {
    onValueChange(Math.max(minimumValue, value - 1));
  }

  function increment() {
    onValueChange(Math.min(maximumValue, value + 1));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={styles.circleMinus} onPress={decrement} hitSlop={8}>
          <Text style={styles.glyph}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable style={styles.circlePlus} onPress={increment} hitSlop={8}>
          <Text style={styles.glyph}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleMinus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
  },
});
