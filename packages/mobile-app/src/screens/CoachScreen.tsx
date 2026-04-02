import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { QuestionCard } from '../components/QuestionCard';

export function CoachScreen({ route, navigation }: any) {
  const { conversationId, firstQuestion, conversationText } = route.params;
  const { userId } = useAuth();
  const { loading, submitAnswer, undoAnswer } = useApi(userId);

  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState<any>(null);

  async function handleNext() {
    if (answer === null || answer === undefined) return;
    try {
      const result = await submitAnswer(conversationId, answer);
      if (result.done === true && result.suggestions) {
        navigation.replace('Results', { results: { dynamics: result.dynamics, suggestions: result.suggestions }, conversationText });
      } else if (result.question) {
        setCurrentQuestion({ question: result.question, questionType: result.questionType, options: result.options, minTitle: result.minTitle, maxTitle: result.maxTitle, minSubtitle: result.minSubtitle, maxSubtitle: result.maxSubtitle, min: result.min, max: result.max, unit: result.unit });
        setQuestionNumber((n: number) => n + 1);
        setAnswer(null);
      } else if (result.type === 'suggestions') {
        // Fallback: wrapped format
        navigation.replace('Results', { results: result.content, conversationText });
      } else if (result.content) {
        setCurrentQuestion(result.content);
        setQuestionNumber((n: number) => n + 1);
        setAnswer(null);
      }
    } catch (e) {}
  }

  async function handleBack() {
    if (questionNumber <= 1) {
      navigation.goBack();
      return;
    }
    try {
      const result = await undoAnswer(conversationId);
      if (result?.question) {
        setCurrentQuestion({ question: result.question, questionType: result.questionType, options: result.options, minTitle: result.minTitle, maxTitle: result.maxTitle, minSubtitle: result.minSubtitle, maxSubtitle: result.maxSubtitle, min: result.min, max: result.max, unit: result.unit });
        setQuestionNumber((n: number) => Math.max(1, n - 1));
        setAnswer(null);
      } else if (result?.content) {
        setCurrentQuestion(result.content);
        setQuestionNumber((n: number) => Math.max(1, n - 1));
        setAnswer(null);
      }
    } catch (e) {}
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.progress}>Question {questionNumber}</Text>
      <Text style={styles.questionText}>{currentQuestion?.question}</Text>

      <QuestionCard
        question={currentQuestion}
        value={answer}
        onChange={setAnswer}
      />

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, (answer === null || loading) && styles.disabled]}
          onPress={handleNext}
          disabled={answer === null || loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.nextBtnText}>Next</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  content: { padding: spacing.xl, paddingTop: 60 },
  progress: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium, marginBottom: spacing.sm },
  questionText: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: colors.textDark, marginBottom: spacing.lg, lineHeight: 24 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing['2xl'] },
  backBtn: { borderWidth: 1, borderColor: colors.primaryMedium, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtnText: { color: colors.primary, fontWeight: typography.fontWeights.medium },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md },
  nextBtnText: { color: 'white', fontWeight: typography.fontWeights.medium },
  disabled: { opacity: 0.5 },
});
