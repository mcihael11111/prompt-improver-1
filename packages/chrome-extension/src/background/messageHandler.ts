import { signIn, signOut, getAuthState, getUserId } from './auth';
import { config } from './config';

export type MessageAction =
  | 'signIn'
  | 'signOut'
  | 'getAuthState'
  | 'getUserId'
  | 'openTab'
  | 'getConfig';

export interface ExtensionMessage {
  action?: MessageAction;
  type?: MessageAction;
  [key: string]: unknown;
}

/**
 * Register the message listener on chrome.runtime.onMessage.
 * Call this once from the service-worker entry point.
 */
export function registerMessageHandler(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void,
    ) => {
      handleMessage(message)
        .then(sendResponse)
        .catch((err: Error) =>
          sendResponse({ error: err.message ?? 'Unknown error' }),
        );

      // Return true to indicate we will respond asynchronously
      return true;
    },
  );
}

async function handleMessage(message: ExtensionMessage): Promise<unknown> {
  const action = message.action || message.type;
  switch (action) {
    case 'signIn': {
      const session = await signIn();
      return { success: true, session };
    }

    case 'signOut': {
      await signOut();
      return { success: true };
    }

    case 'getAuthState': {
      const authState = await getAuthState();
      return { authState };
    }

    case 'getUserId': {
      const userId = await getUserId();
      return { userId };
    }

    case 'openTab': {
      const url = (message.url as string) ?? '';
      if (url) {
        await chrome.tabs.create({ url });
      }
      return { success: true };
    }

    case 'getConfig': {
      return { apiUrl: config.API_URL };
    }

    default:
      return { error: `Unknown action: ${(message as { action: string }).action}` };
  }
}
