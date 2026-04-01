import React from 'react';
import { SingleChoice } from './SingleChoice';

interface Props {
  options: string[];
  selected: string | null;
  onChange: (value: string) => void;
}

export function ToneAndVoice({ options, selected, onChange }: Props) {
  return <SingleChoice options={options} selected={selected} onChange={onChange} />;
}
