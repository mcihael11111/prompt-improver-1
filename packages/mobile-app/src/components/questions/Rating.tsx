import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  minTitle?: string;
  maxTitle?: string;
}

export function Rating({ value, onChange, minTitle, maxTitle }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.circle, value === n && styles.circleSelected]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.circleText, value === n && styles.circleTextSelected]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {(minTitle || maxTitle) && (
        <View style={styles.labels}>
          <Text style={styles.label}>{minTitle}</Text>
          <Text style={styles.label}>{maxTitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  circle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.primaryMedium, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  circleSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  circleText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textDark },
  circleTextSelected: { color: 'white' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  label: { fontSize: typography.fontSizes.xs, color: colors.textMuted },
});
