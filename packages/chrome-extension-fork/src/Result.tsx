import { useState } from 'react';
import { setPromptText as setSitePromptText } from './siteAdapters';

const Result = ({ promptText, onRetry, isManualMode = false, suggestions = [], dynamics = null, selectedSuggestionIndex = 0, onSelectSuggestion = null }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const selectedText = suggestions.length > 0
    ? suggestions[selectedSuggestionIndex]?.text
    : promptText;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleInsert = () => {
    setSitePromptText(selectedText);
    window.postMessage({ type: 'PROMPT_GPT_CLOSE_MODAL' }, '*');
  };

  return (
    <div className="result-container">
      {/* Conversation Dynamics card */}
      {dynamics && (
        <div className="question-content" style={{ marginBottom: '12px' }}>
          <p className="question-progress">CONVERSATION DYNAMICS</p>
          <div style={{ fontSize: '13px', lineHeight: '1.6', marginTop: '6px' }}>
            <p style={{ marginBottom: '4px' }}><strong>Interest:</strong> {dynamics.interestLevel}</p>
            <p style={{ marginBottom: '4px' }}><strong>Tone:</strong> {dynamics.tone}</p>
            <p style={{ marginBottom: '4px' }}><strong>Pattern:</strong> {dynamics.patterns}</p>
            <p><strong>Subtext:</strong> {dynamics.subtext}</p>
          </div>
        </div>
      )}

      {/* Multiple suggestion cards */}
      {suggestions.length > 0 ? (
        suggestions.map((sug: any, idx: number) => (
          <div
            key={idx}
            className="question-content"
            style={{
              marginBottom: '8px',
              cursor: 'pointer',
              border: idx === selectedSuggestionIndex
                ? '2px solid var(--primary-highest)'
                : '1px solid var(--primary-medium)',
              transition: 'border-color 0.15s ease',
            }}
            onClick={() => onSelectSuggestion?.(idx)}
          >
            {/* Header: radio + tone badge + recommended */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '2px solid var(--primary-highest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {idx === selectedSuggestionIndex && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary-highest)' }} />
                )}
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 600, color: 'var(--primary-highest)',
                background: 'var(--secondary-high)', padding: '2px 10px', borderRadius: '12px',
              }}>
                {sug.toneLabel}
              </span>
              {sug.recommended && (
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: '#fff',
                  background: '#22c55e', borderRadius: '12px', padding: '2px 8px', marginLeft: 'auto',
                }}>
                  Best
                </span>
              )}
            </div>

            {/* Message text */}
            <div className="prompt-text-area" style={{ maxHeight: 'none' }}>
              {sug.text}
            </div>

            {/* Collapsible reasoning */}
            {sug.reasoning && (
              <details style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-light)' }}>
                <summary style={{
                  cursor: 'pointer', fontWeight: 600, color: 'var(--primary-highest)',
                  listStyle: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  ▸ Why this works
                </summary>
                <p style={{ marginTop: '6px', lineHeight: '1.6', paddingLeft: '2px' }}>{sug.reasoning}</p>
              </details>
            )}
          </div>
        ))
      ) : (
        <div className="prompt-text-area">
          {promptText}
        </div>
      )}

      {/* Action buttons */}
      <div className="result-buttons">
        {!isManualMode && (
          <button className="result-button primary" onClick={handleInsert}>
            Insert
          </button>
        )}
        <button className={`result-button ${isManualMode ? 'primary' : 'secondary'}`} onClick={handleCopy}>
          {copyButtonText}
        </button>
        <button className="result-button secondary retry" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
};

export default Result;
