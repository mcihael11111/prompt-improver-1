// ─── Inserts text into the chat input ─────────────────────────────
import { useCallback } from 'react';
import { type SiteConfig } from '../services/siteConfigs';
import { insertText } from '../utils/inputInteraction';

/**
 * Returns a function that inserts text into the active chat input
 * using the current site config's selector and insert method.
 */
export function useInputInserter(siteConfig: SiteConfig | null) {
  const insert = useCallback(
    (text: string): boolean => {
      if (!siteConfig) return false;

      const inputEl = document.querySelector(siteConfig.inputSelector);
      if (!inputEl) return false;

      insertText(inputEl, text);
      return true;
    },
    [siteConfig],
  );

  return { insertIntoChat: insert };
}
