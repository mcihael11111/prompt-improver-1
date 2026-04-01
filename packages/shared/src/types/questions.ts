export type QuestionType =
  | 'yesNo'
  | 'singleChoice'
  | 'multipleChoice'
  | 'freeText'
  | 'rating'
  | 'scale'
  | 'minMax'
  | 'toneAndVoice'
  | 'structureAndFormatting';

export interface QuestionContent {
  question: string;
  questionType: QuestionType;
  options?: string[];
  minTitle?: string;
  maxTitle?: string;
  minSubtitle?: string;
  maxSubtitle?: string;
  min?: number;
  max?: number;
  unit?: string;
}

export interface QuestionResponse {
  type: 'question';
  content: QuestionContent;
}

export interface SuggestionsResultResponse {
  type: 'suggestions';
  content: {
    dynamics: {
      interestLevel: string;
      tone: string;
      patterns: string;
      subtext: string;
    };
    suggestions: {
      text: string;
      toneLabel: string;
      reasoning: string;
      recommended: boolean;
    }[];
  };
}

export type CoachResponse = QuestionResponse | SuggestionsResultResponse;
