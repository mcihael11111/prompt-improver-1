import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, typography, spacing } from '../../theme';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
}

export function Scale({ value, onChange, min, max, unit }: Props) {
  return (
    <View>
      <Text style={styles.value}>
        {Math.round(value)}{unit ? ` ${unit}${Math.round(value) !== 1 ? 's' : ''}` : ''}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.primaryMedium}
        thumbTintColor={colors.primary}
      />
      <View style={styles.labels}>
        <Text style={styles.label}>{min}</Text>
        <Text style={styles.label}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: { textAlign: 'center', fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.primary, marginBottom: spacing.sm },
  slider: { width: '100%', height: 40 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: typography.fontSizes.xs, color: colors.textMuted },
});
