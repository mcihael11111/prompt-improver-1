import React from 'react';

interface Dynamics {
  interest: string;
  tone: string;
  patterns: string;
  subtext: string;
}

interface DynamicsCardProps {
  dynamics: Dynamics;
  blurred?: boolean;
}

const DynamicsCard: React.FC<DynamicsCardProps> = ({ dynamics, blurred }) => {
  const rows: { label: string; key: keyof Dynamics }[] = [
    { label: 'Interest', key: 'interest' },
    { label: 'Tone', key: 'tone' },
    { label: 'Patterns', key: 'patterns' },
    { label: 'Subtext', key: 'subtext' },
  ];

  return (
    <div className={`tc-dynamics-card${blurred ? ' tc-dynamics-card--blurred' : ''}`}>
      <h4 className="tc-dynamics-card__header">Conversation Dynamics</h4>
      <div className="tc-dynamics-card__rows">
        {rows.map(({ label, key }) => (
          <div key={key} className="tc-dynamics-card__row">
            <span className="tc-dynamics-card__label">{label}</span>
            <span className="tc-dynamics-card__value">{dynamics[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { Dynamics };
export default DynamicsCard;
