import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';

interface Dynamics {
  interestLevel: string;
  tone: string;
  patterns: string;
  subtext: string;
}

interface Props {
  dynamics: Dynamics;
  blurred?: boolean;
}

export function DynamicsCard({ dynamics, blurred }: Props) {
  const rows = [
    { label: 'Interest', value: dynamics.interestLevel },
    { label: 'Tone', value: dynamics.tone },
    { label: 'Patterns', value: dynamics.patterns },
    { label: 'Subtext', value: dynamics.subtext },
  ];

  return (
    <View style={[styles.card, blurred && styles.blurred]}>
      <Text style={styles.header}>Conversation Dynamics</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}:</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryLowest, borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.md, padding: spacing.base },
  blurred: { opacity: 0.3 },
  header: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.textDark, marginBottom: spacing.sm },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: typography.fontWeights.semibold, fontSize: typography.fontSizes.sm, color: colors.textDark, minWidth: 65 },
  value: { fontSize: typography.fontSizes.sm, color: colors.textLight, flex: 1, lineHeight: 20 },
});
