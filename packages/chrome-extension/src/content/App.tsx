// ─── Root content-script component ────────────────────────────────
import React, { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useApi, ApiError } from './hooks/useApi';
import { useConversation } from './hooks/useConversation';
import { useSiteDetection } from './hooks/useSiteDetection';
import { useMessageExtractor } from './hooks/useMessageExtractor';
import { useInputInserter } from './hooks/useInputInserter';
import { useModalState, type Screen } from './hooks/useModalState';

// ── Screen state machine ──────────────────────────────────────────
// 'welcome'   – initial: choose Quick Suggest or Coach Mode
// 'question'  – Coach Mode question (repeating)
// 'loading'   – waiting for API
// 'results'   – suggestions ready
// 'error'     – something went wrong
// 'noSuggestions' – user has 0 remaining suggestions
// 'upgrade'   – upsell to paid plan

export default function App() {
  const siteConfig = useSiteDetection();
  const { authState, signIn, signOut } = useAuth();
  const api = useApi();
  const conversation = useConversation();
  const { extractConversation } = useMessageExtractor(siteConfig);
  const { insertIntoChat } = useInputInserter(siteConfig);
  const {
    isModalOpen,
    currentScreen,
    openModal,
    closeModal,
    navigateTo,
  } = useModalState();

  // ── Local state ─────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dynamics, setDynamics] = useState<string[]>([]);
  const [conversationText, setConversationText] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────

  const handleOpenModal = useCallback(() => {
    const text = extractConversation();
    setConversationText(text);
    openModal();
  }, [extractConversation, openModal]);

  const handleCloseModal = useCallback(() => {
    closeModal();
    setSuggestions([]);
    setDynamics([]);
    setError(null);
    conversation.reset();
  }, [closeModal, conversation]);

  /** Quick Suggest: welcome -> loading -> results */
  const handleQuickSuggest = useCallback(async () => {
    navigateTo('loading');
    try {
      const result = await api.quickSuggest(
        conversationText,
        siteConfig?.id,
      );
      setSuggestions(result.suggestions);
      setDynamics(result.dynamics ?? []);
      if (result.remaining != null) {
        setRemaining(result.remaining);
      }
      navigateTo('results');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        navigateTo('noSuggestions');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        navigateTo('error');
      }
    }
  }, [api, conversationText, navigateTo, siteConfig]);

  /** Coach Mode: welcome -> question (repeated) -> loading -> results */
  const handleStartCoach = useCallback(async () => {
    navigateTo('loading');
    try {
      await conversation.startCoach(conversationText, siteConfig?.id);
      navigateTo('question');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        navigateTo('noSuggestions');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        navigateTo('error');
      }
    }
  }, [conversation, conversationText, navigateTo, siteConfig]);

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      navigateTo('loading');
      try {
        const result = await conversation.submitAnswer(answer);
        if (result.done) {
          setSuggestions(result.suggestions ?? []);
          setDynamics(result.dynamics ?? []);
          navigateTo('results');
        } else {
          navigateTo('question');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        navigateTo('error');
      }
    },
    [conversation, navigateTo],
  );

  const handleUndoAnswer = useCallback(async () => {
    try {
      await conversation.undoAnswer();
      navigateTo('question');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      navigateTo('error');
    }
  }, [conversation, navigateTo]);

  const handleUseSuggestion = useCallback(
    (text: string) => {
      insertIntoChat(text);
      handleCloseModal();
    },
    [insertIntoChat, handleCloseModal],
  );

  const handleUpgrade = useCallback(async () => {
    try {
      const planData = await api.getPlan();
      setPlan(planData.plan);
      setRemaining(planData.remaining);
      navigateTo('upgrade');
    } catch {
      navigateTo('upgrade');
    }
  }, [api, navigateTo]);

  const handleRetry = useCallback(() => {
    setError(null);
    navigateTo('welcome');
  }, [navigateTo]);

  // ── Render ──────────────────────────────────────────────────────
  // The actual UI components (FloatingButton, FallbackButton, Modal,
  // screen components) will be built in the components/ directory.
  // This root component wires all state and handlers together.

  const isSupported = siteConfig !== null;

  return (
    <>
      {/* Floating action button */}
      {isSupported ? (
        <FloatingButton
          onClick={handleOpenModal}
          position={siteConfig!.buttonPosition}
        />
      ) : (
        <FallbackButton onClick={handleOpenModal} />
      )}

      {/* Modal overlay */}
      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          {currentScreen === 'welcome' && (
            <WelcomeScreen
              authState={authState}
              onSignIn={signIn}
              onSignOut={signOut}
              onQuickSuggest={handleQuickSuggest}
              onStartCoach={handleStartCoach}
              conversationText={conversationText}
            />
          )}
          {currentScreen === 'question' && (
            <QuestionScreen
              question={conversation.currentQuestion ?? ''}
              questionNumber={conversation.questionHistory.length}
              onSubmit={handleSubmitAnswer}
              onUndo={
                conversation.questionHistory.length > 1
                  ? handleUndoAnswer
                  : undefined
              }
              onCancel={handleCloseModal}
            />
          )}
          {currentScreen === 'loading' && <LoadingScreen />}
          {currentScreen === 'results' && (
            <ResultsScreen
              suggestions={suggestions}
              dynamics={dynamics}
              remaining={remaining}
              onUseSuggestion={handleUseSuggestion}
              onUpgrade={handleUpgrade}
              onClose={handleCloseModal}
            />
          )}
          {currentScreen === 'error' && (
            <ErrorScreen error={error} onRetry={handleRetry} />
          )}
          {currentScreen === 'noSuggestions' && (
            <NoSuggestionsScreen onUpgrade={handleUpgrade} onClose={handleCloseModal} />
          )}
          {currentScreen === 'upgrade' && (
            <UpgradeScreen
              plan={plan}
              remaining={remaining}
              onClose={handleCloseModal}
            />
          )}
        </Modal>
      )}
    </>
  );
}

// ── Placeholder components ────────────────────────────────────────
// These will be replaced by real components in content/components/.
// Defined here temporarily so the module compiles.

function FloatingButton(props: {
  onClick: () => void;
  position: string;
}) {
  return (
    <button
      onClick={props.onClick}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 2147483647,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#6366f1',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
      aria-label="Open TextCoach"
    >
      TC
    </button>
  );
}

function FallbackButton(props: { onClick: () => void }) {
  return <FloatingButton onClick={props.onClick} position="above-right" />;
}

function Modal(props: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

function WelcomeScreen(props: {
  authState: { isAuthenticated: boolean; loading: boolean };
  onSignIn: () => void;
  onSignOut: () => void;
  onQuickSuggest: () => void;
  onStartCoach: () => void;
  conversationText: string;
}) {
  if (props.authState.loading) return <p>Loading...</p>;
  if (!props.authState.isAuthenticated) {
    return (
      <div>
        <h3>Welcome to TextCoach</h3>
        <p>Sign in to get started.</p>
        <button onClick={props.onSignIn}>Sign In</button>
      </div>
    );
  }
  return (
    <div>
      <h3>TextCoach</h3>
      {!props.conversationText && (
        <p style={{ color: '#888' }}>
          No conversation detected. Open a chat first.
        </p>
      )}
      <button onClick={props.onQuickSuggest} disabled={!props.conversationText}>
        Quick Suggest
      </button>
      <button onClick={props.onStartCoach} disabled={!props.conversationText}>
        Coach Mode
      </button>
    </div>
  );
}

function QuestionScreen(props: {
  question: string;
  questionNumber: number;
  onSubmit: (answer: string) => void;
  onUndo?: () => void;
  onCancel: () => void;
}) {
  const [answer, setAnswer] = React.useState('');
  return (
    <div>
      <p>
        <strong>Q{props.questionNumber}:</strong> {props.question}
      </p>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        style={{ width: '100%' }}
      />
      <div>
        <button onClick={() => props.onSubmit(answer)} disabled={!answer.trim()}>
          Submit
        </button>
        {props.onUndo && <button onClick={props.onUndo}>Undo</button>}
        <button onClick={props.onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return <p>Thinking...</p>;
}

function ResultsScreen(props: {
  suggestions: string[];
  dynamics: string[];
  remaining: number | null;
  onUseSuggestion: (text: string) => void;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <h3>Suggestions</h3>
      {props.dynamics.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong>Dynamics:</strong>
          <ul>
            {props.dynamics.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {props.suggestions.map((s, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <p>{s}</p>
          <button onClick={() => props.onUseSuggestion(s)}>Use this</button>
        </div>
      ))}
      {props.remaining != null && (
        <p style={{ fontSize: 12, color: '#888' }}>
          {props.remaining} suggestions remaining
        </p>
      )}
      <button onClick={props.onClose}>Close</button>
    </div>
  );
}

function ErrorScreen(props: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div>
      <h3>Error</h3>
      <p>{props.error ?? 'An unexpected error occurred.'}</p>
      <button onClick={props.onRetry}>Try Again</button>
    </div>
  );
}

function NoSuggestionsScreen(props: {
  onUpgrade: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <h3>No Suggestions Remaining</h3>
      <p>You've used all your suggestions. Upgrade to keep going.</p>
      <button onClick={props.onUpgrade}>Upgrade</button>
      <button onClick={props.onClose}>Close</button>
    </div>
  );
}

function UpgradeScreen(props: {
  plan: string | null;
  remaining: number | null;
  onClose: () => void;
}) {
  return (
    <div>
      <h3>Upgrade Your Plan</h3>
      {props.plan && <p>Current plan: {props.plan}</p>}
      {props.remaining != null && (
        <p>{props.remaining} suggestions remaining</p>
      )}
      <p>Visit your account to upgrade for unlimited suggestions.</p>
      <button onClick={props.onClose}>Close</button>
    </div>
  );
}
