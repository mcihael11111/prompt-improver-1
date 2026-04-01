// ─── Modal open/close & screen navigation ────────────────────────
import { useState, useCallback } from 'react';

export type Screen =
  | 'welcome'
  | 'question'
  | 'loading'
  | 'results'
  | 'error'
  | 'noSuggestions'
  | 'upgrade';

export function useModalState(initialScreen: Screen = 'welcome') {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Reset to welcome when closing so re-open starts fresh
    setCurrentScreen('welcome');
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  return {
    isModalOpen,
    currentScreen,
    openModal,
    closeModal,
    navigateTo,
  };
}
