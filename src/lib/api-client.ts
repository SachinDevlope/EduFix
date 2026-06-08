/**
 * Thin fetch wrapper for the browser. All API responses follow the shape
 * `{ success: boolean, data?: T, error?: string, details?: unknown }`.
 */

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init?.headers,
    },
    ...init,
  });

  let json: { success: boolean; data?: T; error?: string; details?: unknown } | null = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON (e.g. file download) handled by caller */
  }

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error ?? `Request failed (${res.status})`, res.status, json?.details);
  }
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
};
