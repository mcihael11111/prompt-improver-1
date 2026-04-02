import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors, typography, spacing, radii } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/auth';
import { saveSession } from '../services/storage';

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

  async function handleGoogleSignIn() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: AuthSession.makeRedirectUri({ scheme: 'textcoach' }),
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data.url) {
        const result = await AuthSession.startAsync({ authUrl: data.url });
        if (result.type === 'success') {
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(result.params.code);
          if (sessionError) throw sessionError;
          await saveSession({
            userId: sessionData.user.id,
            email: sessionData.user.email || undefined,
            accessToken: sessionData.session.access_token,
            refreshToken: sessionData.session.refresh_token,
          });
          onSignIn();
        }
      }
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message);
    }
  }

  async function handleAppleSignIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) throw error;
        await saveSession({
          userId: data.user.id,
          email: data.user.email || undefined,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
        onSignIn();
      }
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign In Failed', e.message);
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <View style={styles.container}>
      <Text style={styles.logo}>TextCoach</Text>
      <Text style={styles.subtitle}>Sign in to start coaching</Text>

      <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
        <Text style={styles.socialText}>Sign in with Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleSignIn}>
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
    </SafeAreaView>
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
