import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, radii } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { useConversation } from '../hooks/useConversation';
import { useOCR } from '../hooks/useOCR';
import { PrivacyBadge } from '../components/PrivacyBadge';

export function HomeScreen({ navigation }: any) {
  const [conversationText, setConversationText] = useState('');
  const { userId } = useAuth();
  const { loading, error, quickSuggest, startCoach } = useApi(userId);
  const { handleCoachStart } = useConversation();
  const { pickAndExtract, processing } = useOCR();

  async function handleQuickSuggest() {
    if (!conversationText.trim()) return;
    try {
      const result = await quickSuggest(conversationText);
      navigation.navigate('Results', { results: result, conversationText });
    } catch (e) {
      // Error handled by useApi
    }
  }

  async function handleCoachMe() {
    if (!conversationText.trim()) return;
    try {
      const result = await startCoach(conversationText);
      handleCoachStart(result);
      navigation.navigate('Coach', { conversationId: result.conversationId, firstQuestion: { question: result.question, questionType: result.questionType, options: result.options, minTitle: result.minTitle, maxTitle: result.maxTitle, minSubtitle: result.minSubtitle, maxSubtitle: result.maxSubtitle, min: result.min, max: result.max, unit: result.unit }, conversationText });
    } catch (e) {
      // Error handled by useApi
    }
  }

  async function handleScreenshot() {
    const text = await pickAndExtract();
    if (text) setConversationText(text);
  }

  async function handlePasteFromClipboard() {
    const text = await Clipboard.getStringAsync();
    if (text) setConversationText(text);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>What did they say?</Text>
      <Text style={styles.subtitle}>Paste the conversation or take a screenshot</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Paste the conversation or their last message..."
        placeholderTextColor={colors.textMuted}
        value={conversationText}
        onChangeText={setConversationText}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.screenshotBtn} onPress={handleScreenshot} disabled={processing}>
        <Text style={styles.screenshotText}>
          {processing ? 'Processing...' : '📸 Use screenshot'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.screenshotBtn} onPress={handlePasteFromClipboard}>
        <Text style={styles.screenshotText}>📋 Paste from clipboard</Text>
      </TouchableOpacity>

      <PrivacyBadge />

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btnSecondary, (!conversationText.trim() || loading) && styles.disabled]}
          onPress={handleCoachMe}
          disabled={!conversationText.trim() || loading}
        >
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.btnSecondaryText}>Coach Me</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, (!conversationText.trim() || loading) && styles.disabled]}
          onPress={handleQuickSuggest}
          disabled={!conversationText.trim() || loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>Quick Suggest</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: spacing.xl, paddingTop: 60 },
  title: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.semibold, color: colors.textDark, textAlign: 'center' },
  subtitle: { fontSize: typography.fontSizes.sm, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.base, marginTop: spacing.xs },
  textInput: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.sm, padding: spacing.md, minHeight: 140, fontSize: typography.fontSizes.base, color: colors.textDark, lineHeight: 22 },
  screenshotBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm },
  screenshotText: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
  error: { color: colors.error, fontSize: typography.fontSizes.sm, marginTop: spacing.sm, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  btnPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center' },
  btnPrimaryText: { color: 'white', fontWeight: typography.fontWeights.medium, fontSize: typography.fontSizes.base },
  btnSecondary: { flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.pill, padding: spacing.md, alignItems: 'center' },
  btnSecondaryText: { color: colors.primary, fontWeight: typography.fontWeights.medium, fontSize: typography.fontSizes.base },
  disabled: { opacity: 0.5 },
});
