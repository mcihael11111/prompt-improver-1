const API_URL = 'https://prompt-improver-eu1y.onrender.com';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-TextCoach-Source': 'mobile',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(res.status, data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function quickSuggest(conversation: string, userId: string, platform?: string) {
  return apiFetch('/quick-suggest', {
    method: 'POST',
    body: JSON.stringify({ conversation, userId, platform }),
  });
}

export async function startCoach(conversation: string, userId: string, platform?: string) {
  return apiFetch('/coach', {
    method: 'POST',
    body: JSON.stringify({ conversation, userId, platform }),
  });
}

export async function submitAnswer(conversationId: string, answer: string | object, userId: string) {
  return apiFetch('/answer', {
    method: 'POST',
    body: JSON.stringify({ conversationId, answer, userId }),
  });
}

export async function undoAnswer(conversationId: string) {
  return apiFetch('/undo-answer', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });
}

export async function getRemaining(userId: string) {
  return apiFetch(`/remaining-prompts?userId=${userId}`);
}

export async function getPlan(userId: string) {
  return apiFetch(`/remaining-prompts/plan?userId=${userId}`);
}

