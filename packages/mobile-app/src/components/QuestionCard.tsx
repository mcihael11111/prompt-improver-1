import React from 'react';
import { View } from 'react-native';
import { SingleChoice } from './questions/SingleChoice';
import { MultipleChoice } from './questions/MultipleChoice';
import { YesNo } from './questions/YesNo';
import { FreeText } from './questions/FreeText';
import { Rating } from './questions/Rating';
import { Scale } from './questions/Scale';
import { ToneAndVoice } from './questions/ToneAndVoice';

interface Props {
  question: {
    questionType: string;
    options?: string[];
    minTitle?: string;
    maxTitle?: string;
    minSubtitle?: string;
    maxSubtitle?: string;
    min?: number;
    max?: number;
    unit?: string;
  };
  value: any;
  onChange: (value: any) => void;
}

export function QuestionCard({ question, value, onChange }: Props) {
  switch (question.questionType) {
    case 'singleChoice':
      return <SingleChoice options={question.options || []} selected={value} onChange={onChange} />;
    case 'multipleChoice':
      return <MultipleChoice options={question.options || []} selected={value || []} onChange={onChange} />;
    case 'yesNo':
      return <YesNo selected={value} onChange={onChange} />;
    case 'freeText':
      return <FreeText value={value || ''} onChange={onChange} />;
    case 'rating':
      return <Rating value={value} onChange={onChange} minTitle={question.minTitle} maxTitle={question.maxTitle} />;
    case 'scale':
      return <Scale value={value ?? question.min ?? 1} onChange={onChange} min={question.min ?? 1} max={question.max ?? 10} unit={question.unit} />;
    case 'toneAndVoice':
      return <ToneAndVoice options={question.options || []} selected={value} onChange={onChange} />;
    default:
      return <FreeText value={value || ''} onChange={onChange} />;
  }
}
