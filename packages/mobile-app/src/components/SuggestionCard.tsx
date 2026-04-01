import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';
import { ReasoningBlock } from './ReasoningBlock';

interface Suggestion {
  text: string;
  toneLabel: string;
  reasoning: string;
  recommended: boolean;
}

interface Props {
  suggestion: Suggestion;
  selected: boolean;
  onSelect: () => void;
  index: number;
}

export function SuggestionCard({ suggestion, selected, onSelect, index }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <Text style={styles.optionLabel}>Option {index + 1}</Text>
        <View style={styles.toneBadge}>
          <Text style={styles.toneBadgeText}>{suggestion.toneLabel}</Text>
        </View>
        {suggestion.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Best</Text>
          </View>
        )}
      </View>

      <View style={styles.textBox}>
        <Text style={styles.suggestionText}>{suggestion.text}</Text>
      </View>

      <ReasoningBlock reasoning={suggestion.reasoning} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.md, padding: spacing.base, marginBottom: spacing.sm },
  cardSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.bgSubtle },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.primaryMedium, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textDark },
  toneBadge: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  toneBadgeText: { color: 'white', fontSize: 10, fontWeight: typography.fontWeights.medium },
  recommendedBadge: { backgroundColor: colors.success, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 'auto' },
  recommendedText: { color: 'white', fontSize: 10, fontWeight: typography.fontWeights.semibold },
  textBox: { backgroundColor: colors.primaryLowest, borderRadius: radii.sm, padding: spacing.md, marginBottom: spacing.sm },
  suggestionText: { fontSize: typography.fontSizes.base, color: colors.textDark, lineHeight: 22 },
});
