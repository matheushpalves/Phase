import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { CycleProfile } from '../db/cycleProfile';
import { getDayInfo, MONTH_NAMES_PT } from '../utils/cycleCalculations';
import { phaseContent, pmsHint } from '../utils/phaseContent';

type TodayStatusCardProps = {
  profile: Pick<CycleProfile, 'last_period_start' | 'cycle_length' | 'period_length'>;
};

export function TodayStatusCard({ profile }: TodayStatusCardProps) {
  const today = new Date();
  const info = getDayInfo(today, profile);
  const content = info.isPmsWindow && info.phase === 'safe' ? pmsHint() : phaseContent[info.phase];

  return (
    <LinearGradient colors={content.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <Text style={styles.eyebrow}>
        HOJE · {today.getDate()} DE {MONTH_NAMES_PT[today.getMonth()].toUpperCase()}
      </Text>
      <Text style={styles.title}>
        {content.emoji} {content.bannerTitle}
      </Text>
      <Text style={styles.description}>{content.homeDescription}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
});
