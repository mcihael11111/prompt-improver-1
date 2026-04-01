import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';
import { useOCR } from '../hooks/useOCR';

interface Props {
  onTextExtracted: (text: string) => void;
}

export function ScreenshotCapture({ onTextExtracted }: Props) {
  const { pickAndExtract, processing, error } = useOCR();

  async function handlePress() {
    const text = await pickAndExtract();
    if (text) onTextExtracted(text);
  }

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={processing}>
        {processing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.text}>📸 Use screenshot</Text>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm },
  text: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
  error: { fontSize: typography.fontSizes.xs, color: colors.error, marginTop: spacing.xs },
});
