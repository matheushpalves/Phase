import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressDots } from '../components/ProgressDots';
import { PeriodStartCalendar } from '../components/PeriodStartCalendar';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import { toISODate } from '../utils/cycleCalculations';
import type { OnboardingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingData'>;

export function OnboardingDataScreen({ route }: Props) {
  const { cycleLength, periodLength } = route.params;
  const { saveCycleDetails } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNavigate(direction: -1 | 1) {
    if (month + direction < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else if (month + direction > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + direction);
    }
  }

  async function handleFinish() {
    if (!selectedDate) return;
    setLoading(true);
    try {
      await saveCycleDetails({ lastPeriodStart: toISODate(selectedDate), cycleLength, periodLength });
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientScreen flat>
      <View style={styles.header}>
        <ProgressDots step={3} total={3} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Quando começou a última menstruação dela?</Text>

        <View style={styles.calendarWrap}>
          <PeriodStartCalendar
            year={year}
            month={month}
            onNavigate={handleNavigate}
            selectedDate={selectedDate}
            periodLength={periodLength}
            onSelectDay={setSelectedDate}
          />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>
            {selectedDate ? `Dia ${selectedDate.getDate()} selecionado` : 'Toque em um dia no calendário'}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label="Finalizar e entrar no jogo"
          onPress={handleFinish}
          disabled={!selectedDate}
          loading={loading}
        />
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  calendarWrap: {
    marginBottom: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.flow,
  },
  legendText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
