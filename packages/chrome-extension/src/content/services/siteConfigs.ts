// ─── Site configurations ──────────────────────────────────────────
// Each config describes how TextCoach interacts with a messaging
// platform's DOM.

export interface SiteConfig {
  id: string;
  name: string;
  hostname: string;
  pathPrefix?: string;
  /** CSS selector for the chat input element */
  inputSelector: string;
  /** CSS selector for the scrollable message container */
  messageContainerSelector: string;
  /** Selector for messages received from the other person */
  incomingMessageSelector: string;
  /** Selector for messages sent by the user */
  outgoingMessageSelector: string;
  /** How to insert text: 'contenteditable' | 'value' */
  insertMethod: 'contenteditable' | 'value';
  /** Where to position the floating button relative to the input */
  buttonPosition: 'above-right' | 'below-right' | 'inside-right';
}

export const siteConfigs: SiteConfig[] = [
  // ── WhatsApp Web ──────────────────────────────────────────────
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    hostname: 'web.whatsapp.com',
    inputSelector: 'div[contenteditable="true"][data-tab="10"]',
    messageContainerSelector: 'div[data-testid="conversation-panel-messages"]',
    incomingMessageSelector: 'div.message-in div.copyable-text',
    outgoingMessageSelector: 'div.message-out div.copyable-text',
    insertMethod: 'contenteditable',
    buttonPosition: 'inside-right',
  },

  // ── Instagram DMs ─────────────────────────────────────────────
  {
    id: 'instagram',
    name: 'Instagram',
    hostname: 'www.instagram.com',
    pathPrefix: '/direct',
    inputSelector: 'div[contenteditable="true"][role="textbox"]',
    messageContainerSelector: 'div[role="grid"]',
    incomingMessageSelector: 'div[class*="xzsf02u"] div[dir="auto"]',
    outgoingMessageSelector: 'div[class*="x1npkx4u"] div[dir="auto"]',
    insertMethod: 'contenteditable',
    buttonPosition: 'inside-right',
  },

  // ── LinkedIn Messaging ────────────────────────────────────────
  {
    id: 'linkedin',
    name: 'LinkedIn',
    hostname: 'www.linkedin.com',
    pathPrefix: '/messaging',
    inputSelector: 'div.msg-form__contenteditable[contenteditable="true"]',
    messageContainerSelector: 'ul.msg-s-message-list',
    incomingMessageSelector: 'li.msg-s-message-list__event div.msg-s-event-listitem__body',
    outgoingMessageSelector: 'li.msg-s-message-list__event div.msg-s-event-listitem__body',
    insertMethod: 'contenteditable',
    buttonPosition: 'above-right',
  },

  // ── Twitter / X DMs ───────────────────────────────────────────
  {
    id: 'twitter',
    name: 'Twitter / X',
    hostname: 'x.com',
    pathPrefix: '/messages',
    inputSelector: 'div[data-testid="dmComposerTextInput"][contenteditable="true"]',
    messageContainerSelector: 'div[data-testid="DmScrollerContainer"]',
    incomingMessageSelector: 'div[data-testid="messageEntry"] div[dir="auto"]',
    outgoingMessageSelector: 'div[data-testid="messageEntry"] div[dir="auto"]',
    insertMethod: 'contenteditable',
    buttonPosition: 'inside-right',
  },

  // ── Facebook Messenger ────────────────────────────────────────
  {
    id: 'messenger',
    name: 'Messenger',
    hostname: 'www.messenger.com',
    inputSelector: 'div[contenteditable="true"][role="textbox"]',
    messageContainerSelector: 'div[role="main"]',
    incomingMessageSelector: 'div[class*="__fb-light-mode"] div[dir="auto"]',
    outgoingMessageSelector: 'div[class*="__fb-light-mode"] div[dir="auto"]',
    insertMethod: 'contenteditable',
    buttonPosition: 'inside-right',
  },

  // ── Discord ───────────────────────────────────────────────────
  {
    id: 'discord',
    name: 'Discord',
    hostname: 'discord.com',
    pathPrefix: '/channels',
    inputSelector: 'div[role="textbox"][contenteditable="true"]',
    messageContainerSelector: 'ol[data-list-id="chat-messages"]',
    incomingMessageSelector: 'li[id^="chat-messages-"] div[id^="message-content-"]',
    outgoingMessageSelector: 'li[id^="chat-messages-"] div[id^="message-content-"]',
    insertMethod: 'contenteditable',
    buttonPosition: 'above-right',
  },

  // ── Slack ─────────────────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    hostname: 'app.slack.com',
    inputSelector: 'div.ql-editor[contenteditable="true"]',
    messageContainerSelector: 'div.c-virtual_list__scroll_container',
    incomingMessageSelector: 'div.c-message__body span.c-message__body',
    outgoingMessageSelector: 'div.c-message__body span.c-message__body',
    insertMethod: 'contenteditable',
    buttonPosition: 'above-right',
  },

  // ── Telegram Web ──────────────────────────────────────────────
  {
    id: 'telegram',
    name: 'Telegram',
    hostname: 'web.telegram.org',
    inputSelector: 'div.input-message-input[contenteditable="true"]',
    messageContainerSelector: 'div.bubbles-inner',
    incomingMessageSelector: 'div.bubble.is-in div.message',
    outgoingMessageSelector: 'div.bubble.is-out div.message',
    insertMethod: 'contenteditable',
    buttonPosition: 'inside-right',
  },
];

/**
 * Find the site config matching the current page, or null.
 */
export function getActiveSiteConfig(): SiteConfig | null {
  const { hostname, pathname } = window.location;
  return (
    siteConfigs.find((cfg) => {
      if (cfg.hostname !== hostname) return false;
      if (cfg.pathPrefix && !pathname.startsWith(cfg.pathPrefix)) return false;
      return true;
    }) ?? null
  );
}
