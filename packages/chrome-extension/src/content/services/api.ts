// ─── Base fetch wrapper ───────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Thin wrapper around fetch that:
 *  - JSON-encodes request bodies
 *  - Parses JSON responses
 *  - Throws ApiError on non-2xx status codes
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      `API ${response.status}: ${response.statusText}`,
      response.status,
      data,
    );
  }

  return data as T;
}
