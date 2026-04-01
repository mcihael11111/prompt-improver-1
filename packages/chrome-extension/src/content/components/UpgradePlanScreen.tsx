import React from 'react';

interface UpgradePlanScreenProps {
  onSelectPlan: (planId: string) => void;
  onBack: () => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$4.99',
    period: '/month',
    features: [
      { text: '30 suggestions per month', included: true },
      { text: 'All question types', included: true },
      { text: 'Conversation dynamics', included: true },
      { text: 'Full reasoning', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    highlighted: true,
    features: [
      { text: 'Unlimited suggestions', included: true },
      { text: 'All question types', included: true },
      { text: 'Conversation dynamics', included: true },
      { text: 'Full reasoning', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

const UpgradePlanScreen: React.FC<UpgradePlanScreenProps> = ({ onSelectPlan, onBack }) => {
  return (
    <div className="tc-upgrade-plan-screen">
      <button
        className="tc-upgrade-plan-screen__back-btn"
        onClick={onBack}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <h2 className="tc-upgrade-plan-screen__title">Choose Your Plan</h2>
      <p className="tc-upgrade-plan-screen__subtitle">
        Unlock the full power of TextCoach
      </p>

      <div className="tc-upgrade-plan-screen__plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`tc-upgrade-plan-screen__card${plan.highlighted ? ' tc-upgrade-plan-screen__card--highlighted' : ''}`}
          >
            {plan.highlighted && (
              <span className="tc-upgrade-plan-screen__popular-badge">Most Popular</span>
            )}
            <h3 className="tc-upgrade-plan-screen__plan-name">{plan.name}</h3>
            <div className="tc-upgrade-plan-screen__pricing">
              <span className="tc-upgrade-plan-screen__price">{plan.price}</span>
              <span className="tc-upgrade-plan-screen__period">{plan.period}</span>
            </div>
            <ul className="tc-upgrade-plan-screen__features">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className={`tc-upgrade-plan-screen__feature${feature.included ? '' : ' tc-upgrade-plan-screen__feature--excluded'}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {feature.included ? (
                      <polyline points="20 6 9 17 4 12" />
                    ) : (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    )}
                  </svg>
                  {feature.text}
                </li>
              ))}
            </ul>
            <button
              className={`tc-upgrade-plan-screen__select-btn${plan.highlighted ? ' tc-upgrade-plan-screen__select-btn--primary' : ''}`}
              onClick={() => onSelectPlan(plan.id)}
              type="button"
            >
              Get {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePlanScreen;
