import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { getPlan } from '../services/api';

interface Props {
  onSignOut: () => void;
}

export function SettingsScreen({ navigation, onSignOut }: Props & { navigation?: any }) {
  const { userId, email, signOut } = useAuth();
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    if (userId) {
      getPlan(userId).then((r: any) => setPlan(r.plan || 'free')).catch(() => {});
    }
  }, [userId]);

  async function handleSignOut() {
    await signOut();
    onSignOut();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email || 'Not signed in'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Plan</Text>
        <Text style={styles.value}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Text>
      </View>

      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={() => navigation?.navigate('Upgrade')}
      >
        <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>TextCoach v2.0.0</Text>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: spacing.xl, paddingTop: 60 },
  title: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.semibold, color: colors.textDark, marginBottom: spacing.lg },
  card: { backgroundColor: colors.primaryLowest, borderRadius: radii.sm, padding: spacing.base, marginBottom: spacing.sm },
  label: { fontSize: typography.fontSizes.sm, color: colors.textMuted, marginBottom: 2 },
  value: { fontSize: typography.fontSizes.base, color: colors.textDark, fontWeight: typography.fontWeights.medium },
  upgradeBtn: { backgroundColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  upgradeBtnText: { color: 'white', fontWeight: typography.fontWeights.medium, fontSize: typography.fontSizes.base },
  signOutBtn: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  signOutText: { color: colors.textMuted, fontWeight: typography.fontWeights.medium },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: typography.fontSizes.xs, marginTop: spacing['2xl'] },
});
