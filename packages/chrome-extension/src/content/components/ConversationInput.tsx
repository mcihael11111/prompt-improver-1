import React from 'react';

interface ConversationInputProps {
  value: string;
  onChange: (value: string) => void;
  onReadFromChat?: () => void;
}

const ConversationInput: React.FC<ConversationInputProps> = ({
  value,
  onChange,
  onReadFromChat,
}) => {
  return (
    <div className="tc-conversation-input">
      <textarea
        className="tc-conversation-input__textarea"
        placeholder="Paste the conversation or their last message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
      {onReadFromChat && (
        <button
          className="tc-conversation-input__read-btn"
          onClick={onReadFromChat}
          type="button"
        >
          Read from chat
        </button>
      )}
    </div>
  );
};

export default ConversationInput;
