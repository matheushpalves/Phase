import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { formatLongDatePt, parseISODate, toISODate } from '../utils/cycleCalculations';

type DateFieldProps = {
  label: string;
  value: string | null; // yyyy-MM-dd
  placeholder?: string;
  onChange: (value: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

export function DateField({ label, value, placeholder, onChange, maximumDate, minimumDate }: DateFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const displayValue = value ? formatLongDatePt(parseISODate(value)) : null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder={placeholder ?? 'AAAA-MM-DD'}
          placeholderTextColor={colors.textDim}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setPickerOpen(true)}>
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue ?? placeholder ?? 'Selecionar data'}
        </Text>
      </Pressable>
      {pickerOpen && (
        <DateTimePicker
          value={value ? parseISODate(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onValueChange={(_event, selectedDate) => {
            onChange(toISODate(selectedDate));
            if (Platform.OS === 'android') {
              setPickerOpen(false);
            }
          }}
          onDismiss={() => setPickerOpen(false)}
        />
      )}
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
    marginBottom: spacing.xs,
  },
  input: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textDim,
  },
});
