// ─── Extracts conversation from the DOM ───────────────────────────
import { useCallback } from 'react';
import { type SiteConfig } from '../services/siteConfigs';
import { parseMessages, formatConversation } from '../utils/messageParser';

/**
 * Provides a function that reads visible messages from the page
 * using the current site config's selectors and returns a formatted
 * conversation string.
 */
export function useMessageExtractor(siteConfig: SiteConfig | null) {
  const extract = useCallback((): string => {
    if (!siteConfig) return '';

    const messages = parseMessages(
      siteConfig.messageContainerSelector,
      siteConfig.incomingMessageSelector,
      siteConfig.outgoingMessageSelector,
    );

    return formatConversation(messages);
  }, [siteConfig]);

  return { extractConversation: extract };
}
