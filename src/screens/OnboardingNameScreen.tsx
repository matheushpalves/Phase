import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressDots } from '../components/ProgressDots';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import type { OnboardingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingName'>;

export function OnboardingNameScreen({ navigation }: Props) {
  const { savePartnerName, cycleProfile } = useApp();
  const [name, setName] = useState(cycleProfile?.partner_name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!name.trim()) {
      setError('Digite o nome dela para continuar.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await savePartnerName(name.trim());
      navigation.navigate('OnboardingCycle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientScreen flat>
      <View style={styles.header}>
        <ProgressDots step={1} total={3} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎯</Text>
          <Text style={styles.title}>Qual o nome dela?</Text>
          <Text style={styles.subtitle}>
            É pra gente te chamar na hora certa e te dar o alerta com nome e tudo. 😉
          </Text>
          <TextField
            label="Nome da namorada"
            placeholder="Camila"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <View style={styles.footer}>
          <Button label="Próximo" onPress={handleContinue} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  emoji: {
    fontSize: 42,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 30,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
