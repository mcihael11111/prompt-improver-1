import React from 'react';
import { SingleChoice } from './SingleChoice';

interface Props {
  selected: string | null;
  onChange: (value: string) => void;
}

export function YesNo({ selected, onChange }: Props) {
  return <SingleChoice options={['Yes', 'No']} selected={selected} onChange={onChange} />;
}
