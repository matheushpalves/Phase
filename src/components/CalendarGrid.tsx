import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { CycleProfile } from '../db/cycleProfile';
import { getDayInfo, getMonthGrid, isSameDay, WEEKDAY_LABELS_PT } from '../utils/cycleCalculations';
import { phaseContent } from '../utils/phaseContent';

type CalendarGridProps = {
  year: number;
  month: number;
  profile: Pick<CycleProfile, 'last_period_start' | 'cycle_length' | 'period_length'>;
  onSelectDay: (date: Date) => void;
};

export function CalendarGrid({ year, month, profile, onSelectDay }: CalendarGridProps) {
  const weeks = getMonthGrid(year, month);
  const today = new Date();

  return (
    <View>
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

            const info = getDayInfo(date, profile);
            const isToday = isSameDay(date, today);
            const content = phaseContent[info.phase];
            const isSafe = info.phase === 'safe';

            return (
              <View key={dayIndex} style={styles.cellWrap}>
                <Pressable
                  onPress={() => onSelectDay(date)}
                  style={[
                    styles.cell,
                    { backgroundColor: isSafe ? colors.surface : content.color },
                    isToday && styles.cellToday,
                  ]}
                >
                  <Text style={[styles.cellText, { color: isSafe ? colors.textSecondary : content.textOnColor }]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  cellWrap: {
    flex: 1,
    alignItems: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  cellText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
  },
});
