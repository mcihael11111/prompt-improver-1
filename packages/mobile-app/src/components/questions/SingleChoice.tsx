import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';

interface Props {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}

export function SingleChoice({ options, selected, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, selected === option && styles.selected]}
          onPress={() => onChange(option)}
        >
          <View style={[styles.radio, selected === option && styles.radioSelected]}>
            {selected === option && <View style={styles.dot} />}
          </View>
          <Text style={styles.text}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, backgroundColor: 'white' },
  selected: { backgroundColor: colors.primaryLowest, borderColor: colors.primary },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.primaryMedium, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  text: { fontSize: typography.fontSizes.base, color: colors.textDark },
});
