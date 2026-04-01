import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';

const plans = [
  {
    name: 'Starter',
    price: '$4.99',
    period: '/mo',
    features: ['30 suggestions/month', '15 coach sessions/month', '3 response options', 'Full reasoning', 'Conversation dynamics'],
    url: 'https://buy.stripe.com/starter',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    features: ['Unlimited suggestions', 'Unlimited coaching', '4 response options', 'Detailed reasoning + risks', 'Anti-pattern detection', 'Priority support'],
    url: 'https://buy.stripe.com/pro',
  },
];

export function UpgradeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Upgrade your plan</Text>

      {plans.map((plan) => (
        <View key={plan.name} style={styles.planCard}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.features.map((f, i) => (
            <Text key={i} style={styles.feature}>✓  {f}</Text>
          ))}
          <View style={styles.pricing}>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.period}>{plan.period}</Text>
          </View>
          <TouchableOpacity style={styles.selectBtn} onPress={() => Linking.openURL(plan.url)}>
            <Text style={styles.selectBtnText}>Select {plan.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: spacing.xl, paddingTop: 60 },
  back: { color: colors.primary, fontWeight: typography.fontWeights.medium, marginBottom: spacing.base },
  title: { fontSize: 22, fontWeight: typography.fontWeights.semibold, color: colors.textDark, textAlign: 'center', marginBottom: spacing.lg },
  planCard: { backgroundColor: colors.primaryLowest, borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.md, padding: spacing.lg, marginBottom: spacing.base },
  planName: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textDark, marginBottom: spacing.sm },
  feature: { fontSize: typography.fontSizes.sm, color: colors.textLight, paddingVertical: 3, lineHeight: 20 },
  pricing: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.base },
  price: { fontSize: 24, fontWeight: typography.fontWeights.semibold, color: colors.textDark },
  period: { fontSize: typography.fontSizes.base, color: colors.textMuted },
  selectBtn: { backgroundColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  selectBtnText: { color: 'white', fontWeight: typography.fontWeights.medium },
});
