import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface Props {
  message?: string;
}

export function LoadingIndicator({ message = 'Analysing conversation...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  text: { marginTop: spacing.base, fontSize: typography.fontSizes.base, color: colors.textMuted },
});
