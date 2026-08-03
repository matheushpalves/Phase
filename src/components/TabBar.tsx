import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';

type TabBarProps = {
  active: 'calendar' | 'history' | 'profile';
  onNavigateCalendar: () => void;
  onNavigateHistory: () => void;
  onNavigateProfile: () => void;
};

export function TabBar({ active, onNavigateCalendar, onNavigateHistory, onNavigateProfile }: TabBarProps) {
  const isCalendar = active === 'calendar';
  const isHistory = active === 'history';
  const isProfile = active === 'profile';

  return (
    <View style={styles.tabBar}>
      <Pressable style={styles.tabItem} onPress={onNavigateCalendar}>
        <Ionicons
          name={isCalendar ? 'calendar' : 'calendar-outline'}
          size={22}
          color={isCalendar ? colors.primaryLight : colors.textMuted}
        />
        <Text style={isCalendar ? styles.tabLabelActive : styles.tabLabel}>Calendário</Text>
      </Pressable>
      <Pressable style={styles.tabItem} onPress={onNavigateHistory}>
        <Ionicons
          name={isHistory ? 'time' : 'time-outline'}
          size={22}
          color={isHistory ? colors.primaryLight : colors.textMuted}
        />
        <Text style={isHistory ? styles.tabLabelActive : styles.tabLabel}>Histórico</Text>
      </Pressable>
      <Pressable style={styles.tabItem} onPress={onNavigateProfile}>
        <Ionicons
          name={isProfile ? 'person' : 'person-outline'}
          size={22}
          color={isProfile ? colors.primaryLight : colors.textMuted}
        />
        <Text style={isProfile ? styles.tabLabelActive : styles.tabLabel}>Perfil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.primaryLight,
  },
});
