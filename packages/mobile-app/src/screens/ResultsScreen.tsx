import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, radii } from '../theme';
import { DynamicsCard } from '../components/DynamicsCard';
import { SuggestionCard } from '../components/SuggestionCard';

export function ResultsScreen({ route, navigation }: any) {
  const { results } = route.params;
  const { dynamics, suggestions } = results;

  const recommendedIndex = suggestions.findIndex((s: any) => s.recommended);
  const [selectedIndex, setSelectedIndex] = useState(recommendedIndex >= 0 ? recommendedIndex : 0);

  async function handleCopy() {
    const selected = suggestions[selectedIndex];
    await Clipboard.setStringAsync(selected.text);
    Alert.alert('Copied!', 'Response copied to clipboard.');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DynamicsCard dynamics={dynamics} />

      <Text style={styles.sectionTitle}>Suggested Responses</Text>

      {suggestions.map((suggestion: any, index: number) => (
        <SuggestionCard
          key={index}
          suggestion={suggestion}
          selected={index === selectedIndex}
          onSelect={() => setSelectedIndex(index)}
          index={index}
        />
      ))}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleCopy}>
          <Text style={styles.btnPrimaryText}>Copy Selected</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.popToTop()}>
          <Text style={styles.btnSecondaryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  sectionTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textDark, marginTop: spacing.base, marginBottom: spacing.sm },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  btnPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center' },
  btnPrimaryText: { color: 'white', fontWeight: typography.fontWeights.medium },
  btnSecondary: { flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center' },
  btnSecondaryText: { color: colors.primary, fontWeight: typography.fontWeights.medium },
});
