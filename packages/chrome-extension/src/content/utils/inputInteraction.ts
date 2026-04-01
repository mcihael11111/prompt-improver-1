// ─── Input field interaction helpers ───────────────────────────────
// Handles both contenteditable divs (WhatsApp, Messenger, etc.)
// and plain textarea / input elements.
// Fires the events React's synthetic event system expects so the
// host app recognises the programmatic change.

/**
 * Insert text into a contenteditable element.
 */
export function insertIntoContentEditable(
  el: HTMLElement,
  text: string,
): void {
  el.focus();

  // Clear existing content
  el.innerHTML = '';

  // Use execCommand for undo-able insertion where supported
  const inserted = document.execCommand('insertText', false, text);
  if (!inserted) {
    // Fallback: set textContent directly
    el.textContent = text;
  }

  // Dispatch input event so the host framework picks up the change
  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

/**
 * Insert text into a textarea or input element,
 * triggering React-compatible change events.
 */
export function insertIntoTextarea(
  el: HTMLTextAreaElement | HTMLInputElement,
  text: string,
): void {
  el.focus();

  // Use the native value setter to bypass React's synthetic handler
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value',
  )?.set ?? Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, text);
  } else {
    el.value = text;
  }

  // React listens for 'input' on the native element
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Generic insert: detects element type and delegates.
 */
export function insertText(el: Element, text: string): void {
  if (
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLInputElement
  ) {
    insertIntoTextarea(el, text);
  } else if (el instanceof HTMLElement) {
    insertIntoContentEditable(el, text);
  }
}
