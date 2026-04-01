import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radii } from '../../theme';

interface Props {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
}

export function MultipleChoice({ options, selected, onChange }: Props) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[styles.option, isSelected && styles.selected]}
            onPress={() => toggle(option)}
          >
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.check}>✓</Text>}
            </View>
            <Text style={styles.text}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, backgroundColor: 'white' },
  selected: { backgroundColor: colors.primaryLowest, borderColor: colors.primary },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 2, borderColor: colors.primaryMedium, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: 'white', fontSize: 10, fontWeight: '700' },
  text: { fontSize: typography.fontSizes.base, color: colors.textDark },
});
