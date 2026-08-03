import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { MOOD_OPTIONS } from '../utils/moodContent';
import type { MoodValue } from '../db/moodLog';

type MoodPickerProps = {
  value: MoodValue | null;
  onChange: (mood: MoodValue) => void;
};

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.row}>
      {MOOD_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 64,
  },
  chipSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primaryLight,
  },
});
