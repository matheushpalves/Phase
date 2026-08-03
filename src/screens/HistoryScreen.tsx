import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import { TabBar } from '../components/TabBar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import { getCycleLogs, CycleLogEntry } from '../db/cycleLog';
import { getMoodLogs, MoodLogEntry } from '../db/moodLog';
import { diffInDays, formatLongDatePt, parseISODate, toISODate } from '../utils/cycleCalculations';
import { MOOD_CONTENT } from '../utils/moodContent';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'History'>;

const TODAY = new Date();

export function HistoryScreen({ navigation }: Props) {
  const { account, logNewCycleStart } = useApp();
  const [cycleLogs, setCycleLogs] = useState<CycleLogEntry[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLogEntry[]>([]);
  const [newCycleDate, setNewCycleDate] = useState<string | null>(toISODate(TODAY));
  const [saving, setSaving] = useState(false);

  const accountId = account?.id;

  const loadHistory = useCallback(async () => {
    if (!accountId) return;
    const [cycles, moods] = await Promise.all([getCycleLogs(accountId), getMoodLogs(accountId)]);
    setCycleLogs(cycles);
    setMoodLogs(moods.slice(0, 30));
  }, [accountId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  async function handleRegisterCycle() {
    if (!newCycleDate) return;
    setSaving(true);
    try {
      await logNewCycleStart(newCycleDate);
      await loadHistory();
    } finally {
      setSaving(false);
    }
  }

  return (
    <GradientScreen flat>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Ciclos registrados e o humor dela ao longo do tempo.</Text>

        <Text style={styles.sectionTitle}>Registrar novo ciclo</Text>
        <DateField
          label="Início do período"
          value={newCycleDate}
          maximumDate={TODAY}
          onChange={setNewCycleDate}
        />
        <Button label="Registrar ciclo" onPress={handleRegisterCycle} loading={saving} style={styles.registerButton} />

        <Text style={styles.sectionTitle}>Ciclos anteriores</Text>
        {cycleLogs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum ciclo registrado ainda.</Text>
        ) : (
          <View style={styles.card}>
            {cycleLogs.map((entry, index) => {
              const previous = cycleLogs[index + 1];
              const length = previous ? diffInDays(parseISODate(entry.start_date), parseISODate(previous.start_date)) : null;
              return (
                <View key={entry.id} style={[styles.row, index > 0 && styles.rowBorder]}>
                  <Text style={styles.rowDate}>{formatLongDatePt(parseISODate(entry.start_date))}</Text>
                  <Text style={styles.rowMeta}>{length !== null ? `Ciclo de ${length} dias` : 'Mais recente'}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Humor recente</Text>
        {moodLogs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum humor registrado ainda. Registre pelo Detalhe do Dia no calendário.</Text>
        ) : (
          <View style={styles.card}>
            {moodLogs.map((entry, index) => {
              const content = MOOD_CONTENT[entry.mood];
              return (
                <View key={entry.id} style={[styles.row, styles.moodRow, index > 0 && styles.rowBorder]}>
                  <Text style={styles.rowDate}>{formatLongDatePt(parseISODate(entry.date))}</Text>
                  <Text style={styles.moodValue}>
                    {content.emoji} {content.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TabBar
        active="history"
        onNavigateCalendar={() => navigation.navigate('Calendar')}
        onNavigateHistory={() => {}}
        onNavigateProfile={() => navigation.navigate('Profile')}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  registerButton: {
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textDim,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  moodRow: {
    alignItems: 'center',
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  moodValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
