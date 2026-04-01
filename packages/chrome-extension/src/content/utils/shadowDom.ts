// ─── Shadow DOM host creation ──────────────────────────────────────

const HOST_ID = 'textcoach-shadow-host';

/**
 * Creates (or returns existing) shadow DOM host element and attaches
 * an open shadow root.  Returns both the host and the shadow root.
 */
export function createShadowHost(): {
  host: HTMLDivElement;
  shadow: ShadowRoot;
} {
  // Re-use if already in the page (HMR / re-injection guard)
  let host = document.getElementById(HOST_ID) as HTMLDivElement | null;
  if (host?.shadowRoot) {
    return { host, shadow: host.shadowRoot };
  }

  host = document.createElement('div');
  host.id = HOST_ID;

  const shadow = host.attachShadow({ mode: 'open' });

  document.body.appendChild(host);
  return { host, shadow };
}

export { HOST_ID };
