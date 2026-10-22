import { STORAGE_KEYS } from './constants';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');

/** Dispatched when the session could not be refreshed — the auth context logs out. */
export const UNAUTHORIZED_EVENT = 'examprep:unauthorized';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface RequestOptions {
  /** Query parameters; `undefined`, `null` and `''` values are dropped. */
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Attach the bearer token. Defaults to true; pass false for public calls. */
  auth?: boolean;
}

// ─── Token store ──────────────────────────────────────────────────────────
// Kept here (not in the auth context) so this module has no React dependency
// and cannot form an import cycle with it.

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string | null, refreshToken?: string | null): void {
  try {
    if (accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
    else localStorage.removeItem(STORAGE_KEYS.accessToken);

    if (refreshToken !== undefined) {
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
      else localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  } catch {
    /* storage unavailable (private mode) — the session stays in memory only */
  }
}

export function clearTokens(): void {
  setTokens(null, null);
}

// ─── Refresh (single-flight) ──────────────────────────────────────────────

let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) return false;

    const session = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!session.accessToken) return false;

    setTokens(session.accessToken, session.refreshToken ?? refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// ─── Request plumbing ─────────────────────────────────────────────────────

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function buildHeaders(body: unknown, opts: RequestOptions, token: string | null): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  if (body !== undefined && body !== null) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const contentType = res.headers.get('content-type') ?? '';

  let data: unknown = null;
  if (text) {
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } else {
      data = text;
    }
  }

  if (!res.ok) {
    const payload = (data ?? {}) as { message?: string; code?: string; details?: unknown };
    const message =
      typeof data === 'string' && data
        ? data
        : payload.message ?? `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, payload.code, payload.details);
  }

  return data as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(path, opts.query);
  const useAuth = opts.auth !== false;

  const send = (token: string | null) =>
    fetch(url, {
      method,
      signal: opts.signal,
      headers: buildHeaders(body, opts, useAuth ? token : null),
      body: body === undefined ? undefined : JSON.stringify(body)
    });

  let res: Response;
  try {
    res = await send(getAccessToken());
  } catch (error) {
    // Preserve intentional cancellation so callers can stop stale requests
    // without presenting an offline/server error to the user.
    if (
      opts.signal?.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw error;
    }

    throw new ApiError(
      0,
      'Unable to connect to the server. Check your internet connection and try again.',
      'NETWORK_ERROR',
      error
    );
  }

  // One transparent retry after a successful token refresh.
  if (res.status === 401 && useAuth && getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await send(getAccessToken());
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
  }

  return parseResponse<T>(res);
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, body, opts),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, undefined, opts)
};

export { BASE_URL as API_BASE_URL };
