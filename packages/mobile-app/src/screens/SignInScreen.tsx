import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onSignIn: () => void;
}

export function SignInScreen({ onSignIn }: Props & { navigation?: any }) {
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleEmailSignIn() {
    try {
      await signInWithEmail(email, password);
      onSignIn();
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TextCoach</Text>
      <Text style={styles.subtitle}>Sign in to start coaching</Text>

      <TouchableOpacity style={styles.socialButton}>
        <Text style={styles.socialText}>Sign in with Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
          <Text style={[styles.socialText, { color: 'white' }]}>Sign in with Apple</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.emailButton, loading && styles.disabled]}
        onPress={handleEmailSignIn}
        disabled={loading}
      >
        <Text style={styles.emailButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: spacing.xl, justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: typography.fontWeights.bold, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.base, color: colors.textMuted, textAlign: 'center', marginBottom: spacing['2xl'] },
  socialButton: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center' },
  appleButton: { backgroundColor: '#000', borderColor: '#000' },
  socialText: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textDark },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.primaryLowest },
  dividerText: { marginHorizontal: spacing.sm, color: colors.textMuted, fontSize: typography.fontSizes.sm },
  input: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.sm, fontSize: typography.fontSizes.base, color: colors.textDark },
  emailButton: { backgroundColor: colors.primary, borderRadius: radii.pill, padding: spacing.base, alignItems: 'center', marginTop: spacing.sm },
  emailButtonText: { color: 'white', fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium },
  disabled: { opacity: 0.6 },
});
