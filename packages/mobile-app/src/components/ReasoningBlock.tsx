import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface Props {
  reasoning: string;
  truncated?: boolean;
}

export function ReasoningBlock({ reasoning, truncated }: Props) {
  const [expanded, setExpanded] = useState(false);

  const displayText = truncated && !expanded
    ? reasoning.split('.')[0] + '.'
    : reasoning;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.header}>
        <Text style={styles.headerText}>Why this works</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {(expanded || !truncated) && (
        <Text style={styles.content}>{displayText}</Text>
      )}
      {truncated && !expanded && (
        <Text style={styles.truncatedText}>{displayText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderTopColor: colors.primaryLowest, paddingTop: spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.primary },
  chevron: { fontSize: 10, color: colors.primary },
  content: { fontSize: typography.fontSizes.sm, color: colors.textLight, lineHeight: 20, marginTop: spacing.xs },
  truncatedText: { fontSize: typography.fontSizes.sm, color: colors.textMuted, lineHeight: 20, marginTop: spacing.xs },
});
