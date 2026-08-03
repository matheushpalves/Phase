import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { ProgressDots } from '../components/ProgressDots';
import { StepperField } from '../components/StepperField';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import type { OnboardingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCycle'>;

export function OnboardingCycleScreen({ navigation }: Props) {
  const { cycleProfile } = useApp();
  const [cycleLength, setCycleLength] = useState(cycleProfile?.cycle_length ?? 28);
  const [periodLength, setPeriodLength] = useState(cycleProfile?.period_length ?? 5);

  function handleNext() {
    navigation.navigate('OnboardingData', { cycleLength, periodLength });
  }

  return (
    <GradientScreen flat>
      <View style={styles.header}>
        <ProgressDots step={2} total={3} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Configura o ciclo dela</Text>
        <Text style={styles.subtitle}>Não sabe direito? Deixa no padrão que a gente calcula sozinho.</Text>

        <StepperField
          label="Duração do ciclo (dias)"
          value={cycleLength}
          minimumValue={21}
          maximumValue={40}
          onValueChange={setCycleLength}
        />

        <StepperField
          label="Duração da menstruação (dias)"
          value={periodLength}
          minimumValue={2}
          maximumValue={10}
          onValueChange={setPeriodLength}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Próximo" onPress={handleNext} />
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
    fontSize: 28,
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
