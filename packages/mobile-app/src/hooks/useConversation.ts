import { useState, useCallback } from 'react';

interface QuestionContent {
  question: string;
  questionType: string;
  options?: string[];
  minTitle?: string;
  maxTitle?: string;
  minSubtitle?: string;
  maxSubtitle?: string;
  min?: number;
  max?: number;
  unit?: string;
}

export function useConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionContent | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCoachStart = useCallback((response: any) => {
    setConversationId(response.conversationId);
    setCurrentQuestion(response.content);
    setQuestionNumber(1);
    setIsComplete(false);
    setResults(null);
  }, []);

  const handleAnswer = useCallback((response: any) => {
    if (response.type === 'suggestions') {
      setIsComplete(true);
      setResults(response.content);
    } else if (response.type === 'question') {
      setCurrentQuestion(response.content);
      setQuestionNumber((n) => n + 1);
    }
  }, []);

  const handleUndo = useCallback((response: any) => {
    if (response.type === 'question') {
      setCurrentQuestion(response.content);
      setQuestionNumber((n) => Math.max(1, n - 1));
    }
  }, []);

  const reset = useCallback(() => {
    setConversationId(null);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setIsComplete(false);
    setResults(null);
  }, []);

  return {
    conversationId,
    currentQuestion,
    questionNumber,
    isComplete,
    results,
    handleCoachStart,
    handleAnswer,
    handleUndo,
    reset,
  };
}
