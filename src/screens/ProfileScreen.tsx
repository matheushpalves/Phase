import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { AvatarPicker } from '../components/AvatarPicker';
import { DateField } from '../components/DateField';
import { RelationshipStatusField } from '../components/RelationshipStatusField';
import { Button } from '../components/Button';
import { TabBar } from '../components/TabBar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/layout';
import { useApp } from '../context/AppContext';
import { pickAndPersistAvatar } from '../utils/avatarPicker';
import { formatRelationshipDuration } from '../utils/relationship';
import type { RelationshipStatus } from '../db/cycleProfile';
import type { MainStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

const TODAY = new Date();

export function ProfileScreen({ navigation }: Props) {
  const {
    account,
    cycleProfile,
    updateUserAvatar,
    updatePartnerAvatar,
    updateUserBirthday,
    updatePartnerBirthday,
    updateRelationshipDetails,
    logout,
  } = useApp();
  const [pickingUser, setPickingUser] = useState(false);
  const [pickingPartner, setPickingPartner] = useState(false);

  const [birthday, setBirthday] = useState(account?.birthday ?? null);
  const [partnerBirthday, setPartnerBirthday] = useState(cycleProfile?.partner_birthday ?? null);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(
    cycleProfile?.relationship_status ?? null
  );
  const [relationshipStartDate, setRelationshipStartDate] = useState(cycleProfile?.relationship_start_date ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timeout);
  }, [saved]);

  if (!account || !cycleProfile) return null;
  const accountId = account.id;

  async function handlePickUserAvatar() {
    setPickingUser(true);
    try {
      const uri = await pickAndPersistAvatar('user', accountId);
      if (uri) await updateUserAvatar(uri);
    } finally {
      setPickingUser(false);
    }
  }

  async function handlePickPartnerAvatar() {
    setPickingPartner(true);
    try {
      const uri = await pickAndPersistAvatar('partner', accountId);
      if (uri) await updatePartnerAvatar(uri);
    } finally {
      setPickingPartner(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        updateUserBirthday(birthday),
        updatePartnerBirthday(partnerBirthday),
        updateRelationshipDetails({ startDate: relationshipStartDate, status: relationshipStatus }),
      ]);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <GradientScreen flat>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seu perfil</Text>
        <Text style={styles.subtitle}>Personalize com as fotos de vocês dois e as datas importantes.</Text>

        <View style={styles.avatarsRow}>
          <View style={styles.avatarBlock}>
            <AvatarPicker
              uri={account.avatar_uri}
              fallbackLabel={account.name || account.email}
              loading={pickingUser}
              onPress={handlePickUserAvatar}
            />
            <Text style={styles.avatarName}>{account.name || 'Você'}</Text>
            <Text style={styles.avatarRole}>Você</Text>
          </View>

          <View style={styles.avatarBlock}>
            <AvatarPicker
              uri={cycleProfile.partner_avatar_uri}
              fallbackLabel={cycleProfile.partner_name}
              loading={pickingPartner}
              onPress={handlePickPartnerAvatar}
            />
            <Text style={styles.avatarName}>{cycleProfile.partner_name}</Text>
            <Text style={styles.avatarRole}>Namorada</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{account.email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Aniversários</Text>
        <DateField label="Seu aniversário" value={birthday} maximumDate={TODAY} onChange={setBirthday} />
        <DateField
          label={`Aniversário da ${cycleProfile.partner_name}`}
          value={partnerBirthday}
          maximumDate={TODAY}
          onChange={setPartnerBirthday}
        />

        <Text style={styles.sectionTitle}>Relacionamento</Text>
        <RelationshipStatusField label="Como vocês estão" value={relationshipStatus} onChange={setRelationshipStatus} />
        <DateField
          label="Juntos desde"
          value={relationshipStartDate}
          maximumDate={TODAY}
          onChange={setRelationshipStartDate}
        />
        {relationshipStartDate ? (
          <View style={styles.durationCard}>
            <Text style={styles.durationText}>💕 {formatRelationshipDuration(relationshipStartDate)}</Text>
          </View>
        ) : null}

        <Button
          label={saved ? 'Salvo ✓' : 'Salvar'}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>

      <TabBar
        active="profile"
        onNavigateCalendar={() => navigation.navigate('Calendar')}
        onNavigateHistory={() => navigation.navigate('History')}
        onNavigateProfile={() => {}}
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
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: 4,
  },
  avatarName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  avatarRole: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  durationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  durationText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.danger,
  },
});
