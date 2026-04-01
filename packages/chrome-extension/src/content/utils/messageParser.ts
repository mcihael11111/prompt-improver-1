// ─── DOM message parsing ──────────────────────────────────────────
// Reads chat messages from the DOM and returns a normalised
// "Them: …\nYou: …" conversation string.

export interface ParsedMessage {
  direction: 'incoming' | 'outgoing';
  text: string;
}

/**
 * Extracts visible messages from a container using the provided
 * CSS selectors.
 */
export function parseMessages(
  containerSelector: string,
  incomingSelector: string,
  outgoingSelector: string,
): ParsedMessage[] {
  const container = document.querySelector(containerSelector);
  if (!container) return [];

  const incoming = Array.from(container.querySelectorAll(incomingSelector));
  const outgoing = Array.from(container.querySelectorAll(outgoingSelector));

  // Build a combined list sorted by DOM order
  const all = [
    ...incoming.map((el) => ({
      el,
      direction: 'incoming' as const,
    })),
    ...outgoing.map((el) => ({
      el,
      direction: 'outgoing' as const,
    })),
  ];

  // Sort by document position
  all.sort((a, b) => {
    const pos = a.el.compareDocumentPosition(b.el);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  return all
    .map(({ el, direction }) => ({
      direction,
      text: (el.textContent ?? '').trim(),
    }))
    .filter((m) => m.text.length > 0);
}

/**
 * Formats parsed messages into the "Them: / You:" string format
 * expected by the API.
 */
export function formatConversation(messages: ParsedMessage[]): string {
  return messages
    .map((m) =>
      m.direction === 'incoming' ? `Them: ${m.text}` : `You: ${m.text}`,
    )
    .join('\n');
}
