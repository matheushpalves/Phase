import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import { formatLongDatePt, getDayInfo, MONTH_NAMES_PT, parseISODate } from '../utils/cycleCalculations';
import { phaseContent, pmsHint } from '../utils/phaseContent';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'DayDetail'>;

export function DayDetailScreen({ route, navigation }: Props) {
  const { cycleProfile } = useApp();
  if (!cycleProfile) return null;

  const date = parseISODate(route.params.date);
  const info = getDayInfo(date, cycleProfile);
  const content = info.isPmsWindow && info.phase === 'safe' ? pmsHint() : phaseContent[info.phase];

  const eyebrow =
    info.phase === 'flow'
      ? `${content.cycleLabel} · Dia ${info.cycleDayNumber} de ${cycleProfile.period_length}`
      : content.cycleLabel.toUpperCase();

  return (
    <GradientScreen flat>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES_PT[date.getMonth()]} {date.getFullYear()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateTitle}>{formatLongDatePt(date)}</Text>

        <LinearGradient
          colors={content.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerEmoji}>{content.emoji}</Text>
          <Text style={styles.bannerTitle}>{content.bannerTitle}</Text>
          <Text style={styles.bannerEyebrow}>{eyebrow}</Text>
        </LinearGradient>

        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>Dica do Phase</Text>
          <Text style={styles.tipText}>{content.tipDescription}</Text>
        </View>
      </ScrollView>

      <Text style={styles.footerText}>Toque em outro dia no calendário pra ver o status</Text>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    fontSize: 18,
    color: colors.white,
  },
  monthLabel: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  dateTitle: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  banner: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  bannerEmoji: {
    fontSize: 38,
  },
  bannerTitle: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 26,
    color: colors.white,
  },
  bannerEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.85)',
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tipLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textDim,
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
});
