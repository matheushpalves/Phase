import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientScreen } from '../components/GradientScreen';
import { MoonLogo } from '../components/MoonLogo';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/layout';
import { useApp } from '../context/AppContext';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <MoonLogo size={76} />
          <Text style={styles.title}>PHASE</Text>
          <Text style={styles.subtitle}>Fique ligado no ciclo dela e não seja pego de surpresa. 😅</Text>

          <View style={styles.form}>
            <TextField
              label="E-mail"
              placeholder="joao@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button label="Entrar" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta? </Text>
            <Text style={styles.footerLink} onPress={() => navigation.navigate('SignUp')}>
              Criar agora →
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingExtraBold,
    fontSize: 38,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  form: {
    marginTop: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryLight,
    fontSize: 14,
  },
});
