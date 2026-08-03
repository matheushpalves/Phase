import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { CalendarGrid } from '../components/CalendarGrid';
import { TodayStatusCard } from '../components/TodayStatusCard';
import { TabBar } from '../components/TabBar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES_PT, toISODate } from '../utils/cycleCalculations';
import type { MainStackParamList } from '../navigation/types';

const LEGEND_ITEMS: { label: string; color: string }[] = [
  { label: 'Menstruação', color: colors.flow },
  { label: 'Fértil', color: colors.fertile },
  { label: 'Liberado', color: colors.safe },
];

type Props = NativeStackScreenProps<MainStackParamList, 'Calendar'>;

export function CalendarScreen({ navigation }: Props) {
  const { account, cycleProfile } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  if (!cycleProfile || !account) return null;

  function goToPreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleSelectDay(date: Date) {
    navigation.navigate('DayDetail', { date: toISODate(date) });
  }

  return (
    <GradientScreen flat>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>E aí, comandante 🫡</Text>
            <Text style={styles.eyebrow}>Acompanhando: {cycleProfile.partner_name}</Text>
          </View>
          <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')} hitSlop={10}>
            {account.avatar_uri ? (
              <Image source={{ uri: account.avatar_uri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(account.name || account.email).charAt(0).toUpperCase()}</Text>
            )}
          </Pressable>
        </View>

        <TodayStatusCard profile={cycleProfile} />

        <View style={styles.monthNav}>
          <Pressable style={styles.navButton} onPress={goToPreviousMonth} hitSlop={10}>
            <Text style={styles.navChevron}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES_PT[month]} {year}
          </Text>
          <Pressable style={styles.navButton} onPress={goToNextMonth} hitSlop={10}>
            <Text style={styles.navChevron}>›</Text>
          </Pressable>
        </View>

        <CalendarGrid year={year} month={month} profile={cycleProfile} onSelectDay={handleSelectDay} />

        <View style={styles.legendRow}>
          {LEGEND_ITEMS.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TabBar
        active="calendar"
        onNavigateCalendar={() => {}}
        onNavigateHistory={() => navigation.navigate('History')}
        onNavigateProfile={() => navigation.navigate('Profile')}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navChevron: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  monthLabel: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  legendLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
