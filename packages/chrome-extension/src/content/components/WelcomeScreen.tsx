import React from 'react';
import ConversationInput from './ConversationInput';
import PrivacyBadge from './PrivacyBadge';

interface WelcomeScreenProps {
  onQuickSuggest: (text: string) => void;
  onCoachMe: (text: string) => void;
  onReadFromChat?: () => void;
  conversationText: string;
  onConversationChange: (text: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onQuickSuggest,
  onCoachMe,
  onReadFromChat,
  conversationText,
  onConversationChange,
}) => {
  return (
    <div className="tc-welcome-screen">
      <h2 className="tc-welcome-screen__title">What did they say?</h2>

      <ConversationInput
        value={conversationText}
        onChange={onConversationChange}
        onReadFromChat={onReadFromChat}
      />

      <PrivacyBadge />

      <div className="tc-welcome-screen__actions">
        <button
          className="tc-welcome-screen__btn tc-welcome-screen__btn--secondary"
          onClick={() => onQuickSuggest(conversationText)}
          disabled={!conversationText.trim()}
          type="button"
        >
          Quick Suggest
        </button>
        <button
          className="tc-welcome-screen__btn tc-welcome-screen__btn--primary"
          onClick={() => onCoachMe(conversationText)}
          disabled={!conversationText.trim()}
          type="button"
        >
          Coach Me
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
