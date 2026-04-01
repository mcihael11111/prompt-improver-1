import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function FreeText({ value, onChange }: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Type your answer..."
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChange}
      multiline
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.sm, padding: spacing.md, fontSize: typography.fontSizes.base, color: colors.textDark, minHeight: 80, textAlignVertical: 'top' },
});
