import React from 'react';
import SingleChoice from './questions/SingleChoice';
import MultipleChoice from './questions/MultipleChoice';
import YesNo from './questions/YesNo';
import FreeText from './questions/FreeText';
import Rating from './questions/Rating';
import Scale from './questions/Scale';
import MinMax from './questions/MinMax';
import ToneAndVoice from './questions/ToneAndVoice';
import StructureAndFormatting from './questions/StructureAndFormatting';

type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'free_text'
  | 'rating'
  | 'scale'
  | 'min_max'
  | 'tone_and_voice'
  | 'structure_and_formatting';

interface QuestionContent {
  questionType: QuestionType;
  questionText: string;
  options?: string[];
  minTitle?: string;
  maxTitle?: string;
  minSubtitle?: string;
  maxSubtitle?: string;
  min?: number;
  max?: number;
  unit?: string;
}

interface QuestionScreenProps {
  question: QuestionContent;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: unknown) => void;
  onBack: () => void;
  canGoBack: boolean;
  currentAnswer?: unknown;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  canGoBack,
  currentAnswer,
}) => {
  const renderQuestionType = () => {
    switch (question.questionType) {
      case 'single_choice':
        return (
          <SingleChoice
            options={question.options || []}
            selected={(currentAnswer as string) ?? null}
            onChange={onAnswer}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoice
            options={question.options || []}
            selected={(currentAnswer as string[]) ?? []}
            onChange={onAnswer}
          />
        );
      case 'yes_no':
        return (
          <YesNo
            selected={(currentAnswer as boolean) ?? null}
            onChange={onAnswer}
          />
        );
      case 'free_text':
        return (
          <FreeText
            value={(currentAnswer as string) ?? ''}
            onChange={onAnswer}
          />
        );
      case 'rating':
        return (
          <Rating
            value={(currentAnswer as number) ?? null}
            onChange={onAnswer}
            minTitle={question.minTitle || ''}
            maxTitle={question.maxTitle || ''}
            minSubtitle={question.minSubtitle}
            maxSubtitle={question.maxSubtitle}
          />
        );
      case 'scale':
        return (
          <Scale
            value={(currentAnswer as number) ?? question.min ?? 0}
            onChange={onAnswer}
            min={question.min ?? 0}
            max={question.max ?? 100}
            unit={question.unit}
          />
        );
      case 'min_max': {
        const minMaxVal = (currentAnswer as { min: number; max: number }) ?? {
          min: question.min ?? 0,
          max: question.max ?? 100,
        };
        return (
          <MinMax
            minValue={minMaxVal.min}
            maxValue={minMaxVal.max}
            onChange={(minV, maxV) => onAnswer({ min: minV, max: maxV })}
            min={question.min ?? 0}
            max={question.max ?? 100}
            unit={question.unit}
          />
        );
      }
      case 'tone_and_voice':
        return (
          <ToneAndVoice
            options={question.options || []}
            selected={(currentAnswer as string) ?? null}
            onChange={onAnswer}
          />
        );
      case 'structure_and_formatting':
        return (
          <StructureAndFormatting
            options={question.options || []}
            selected={(currentAnswer as string) ?? null}
            onChange={onAnswer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="tc-question-screen">
      <div className="tc-question-screen__progress">
        <span className="tc-question-screen__progress-text">
          {questionNumber} of {totalQuestions}
        </span>
        <div className="tc-question-screen__progress-bar">
          <div
            className="tc-question-screen__progress-fill"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="tc-question-screen__text">{question.questionText}</h3>

      <div className="tc-question-screen__answer">{renderQuestionType()}</div>

      <div className="tc-question-screen__actions">
        {canGoBack && (
          <button
            className="tc-question-screen__btn tc-question-screen__btn--back"
            onClick={onBack}
            type="button"
          >
            Back
          </button>
        )}
        <button
          className="tc-question-screen__btn tc-question-screen__btn--next"
          onClick={() => onAnswer(currentAnswer)}
          disabled={currentAnswer === undefined || currentAnswer === null}
          type="button"
        >
          {questionNumber === totalQuestions ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export type { QuestionContent, QuestionType };
export default QuestionScreen;
