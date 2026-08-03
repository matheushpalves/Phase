import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { addDays, getMonthGrid, isSameDay, MONTH_NAMES_PT, WEEKDAY_LABELS_PT } from '../utils/cycleCalculations';

type PeriodStartCalendarProps = {
  year: number;
  month: number;
  onNavigate: (direction: -1 | 1) => void;
  selectedDate: Date | null;
  periodLength: number;
  onSelectDay: (date: Date) => void;
};

export function PeriodStartCalendar({
  year,
  month,
  onNavigate,
  selectedDate,
  periodLength,
  onSelectDay,
}: PeriodStartCalendarProps) {
  const weeks = getMonthGrid(year, month);
  const today = new Date();
  const periodEnd = selectedDate ? addDays(selectedDate, periodLength - 1) : null;

  function isInPeriodRange(date: Date) {
    if (!selectedDate || !periodEnd) return false;
    return date >= startOfDay(selectedDate) && date <= startOfDay(periodEnd);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={() => onNavigate(-1)} hitSlop={10}>
          <Text style={styles.chevron}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES_PT[month]} {year}
        </Text>
        <Pressable onPress={() => onNavigate(1)} hitSlop={10}>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS_PT.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((date, dayIndex) => {
            if (!date) {
              return <View key={dayIndex} style={styles.cellWrap} />;
            }
            const isFuture = date > today;
            const inRange = isInPeriodRange(date);
            const isToday = isSameDay(date, today);

            return (
              <View key={dayIndex} style={styles.cellWrap}>
                <Pressable
                  disabled={isFuture}
                  onPress={() => onSelectDay(date)}
                  style={[
                    styles.cell,
                    inRange && styles.cellSelected,
                    isToday && !inRange && styles.cellToday,
                    isFuture && styles.cellDisabled,
                  ]}
                >
                  <Text style={[styles.cellText, inRange && styles.cellTextSelected]}>{date.getDate()}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  chevron: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  monthLabel: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.white,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  week: {
    flexDirection: 'row',
  },
  cellWrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.flow,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
  },
  cellDisabled: {
    opacity: 0.3,
  },
  cellText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cellTextSelected: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
  },
});
