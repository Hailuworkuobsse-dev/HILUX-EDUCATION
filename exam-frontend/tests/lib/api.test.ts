import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  api,
  ApiError,
  clearTokens,
  getAccessToken,
  setTokens,
  UNAUTHORIZED_EVENT
} from '@/lib/api';

type FetchArgs = { url: string; init: RequestInit };
const calls: FetchArgs[] = [];

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function mockFetchSequence(responses: Array<Response | (() => Response)>) {
  let i = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init });
      const next = responses[Math.min(i, responses.length - 1)];
      i += 1;
      return typeof next === 'function' ? next() : next;
    })
  );
}

beforeEach(() => {
  calls.length = 0;
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const headersOf = (i = 0) => (calls[i].init.headers ?? {}) as Record<string, string>;

describe('api client', () => {
  it('prefixes the base URL and parses JSON', async () => {
    mockFetchSequence([jsonResponse({ ok: true })]);
    await expect(api.get<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
    expect(calls[0].url).toBe('/api/health');
    expect(calls[0].init.method).toBe('GET');
  });

  it('serializes query params, dropping undefined/null/empty', async () => {
    mockFetchSequence([jsonResponse([])]);
    await api.get('/admin/users', {
      query: { page: 2, pageSize: 25, role: undefined, status: null, search: '' }
    });
    expect(calls[0].url).toBe('/api/admin/users?page=2&pageSize=25');
  });

  it('sends a JSON body for post/patch and no Content-Type for GET', async () => {
    mockFetchSequence([jsonResponse({ id: 1 }), jsonResponse({ id: 1 })]);
    await api.post('/teacher/questions', { prompt: 'x' });
    expect(headersOf(0)['Content-Type']).toBe('application/json');
    expect(calls[0].init.body).toBe(JSON.stringify({ prompt: 'x' }));

    await api.get('/teacher/questions');
    expect(headersOf(1)['Content-Type']).toBeUndefined();
    expect(calls[1].init.body).toBeUndefined();
  });

  it('attaches the bearer token when one is stored', async () => {
    setTokens('access-123');
    mockFetchSequence([jsonResponse({})]);
    await api.get('/me/preferences');
    expect(headersOf(0).Authorization).toBe('Bearer access-123');
  });

  it('omits Authorization when auth:false', async () => {
    setTokens('access-123');
    mockFetchSequence([jsonResponse({})]);
    await api.post('/auth/login', { identifier: 'a@b.c', password: 'x' }, { auth: false });
    expect(headersOf(0).Authorization).toBeUndefined();
  });

  it('maps an error body onto ApiError with status/code/details', async () => {
    mockFetchSequence([
      jsonResponse({ message: 'Prompt is too short', code: 'BAD_REQUEST', details: { prompt: ['x'] } }, 400)
    ]);

    const err = await api.post('/teacher/questions', {}).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Prompt is too short');
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.details).toEqual({ prompt: ['x'] });
  });

  it('returns undefined for 204 and survives a non-JSON body', async () => {
    mockFetchSequence([new Response(null, { status: 204 }), new Response('oops', { status: 500 })]);
    await expect(api.delete('/x/1')).resolves.toBeUndefined();

    const err = await api.get('/x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
    expect(err.message).toBe('oops');
  });

  it('refreshes once on 401, stores the new tokens and retries', async () => {
    setTokens('stale', 'refresh-1');
    mockFetchSequence([
      jsonResponse({ message: 'expired', code: 'UNAUTHORIZED' }, 401),
      jsonResponse({ accessToken: 'fresh', refreshToken: 'refresh-2', expiresIn: 900 }),
      jsonResponse({ id: 'ok' })
    ]);

    await expect(api.get<{ id: string }>('/admin/overview')).resolves.toEqual({ id: 'ok' });

    expect(calls).toHaveLength(3);
    expect(calls[1].url).toBe('/api/auth/refresh');
    expect(JSON.parse(String(calls[1].init.body))).toEqual({ refreshToken: 'refresh-1' });
    expect(headersOf(2).Authorization).toBe('Bearer fresh');
    expect(getAccessToken()).toBe('fresh');
  });

  it('clears tokens and fires the unauthorized event when refresh fails', async () => {
    setTokens('stale', 'bad-refresh');
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    mockFetchSequence([
      jsonResponse({ message: 'expired' }, 401),
      jsonResponse({ message: 'invalid refresh token' }, 401),
      jsonResponse({})
    ]);

    await expect(api.get('/admin/overview')).rejects.toBeInstanceOf(ApiError);

    expect(getAccessToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    // It must not retry the original request after a failed refresh.
    expect(calls).toHaveLength(2);
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it('does not attempt a refresh for public calls', async () => {
    setTokens('stale', 'refresh-1');
    mockFetchSequence([jsonResponse({ message: 'nope' }, 401)]);

    await expect(api.post('/auth/login', {}, { auth: false })).rejects.toMatchObject({ status: 401 });
    expect(calls).toHaveLength(1);
    expect(getAccessToken()).toBe('stale');
  });

  it('clearTokens removes both tokens', () => {
    setTokens('a', 'b');
    clearTokens();
    expect(localStorage.getItem('examprep.accessToken')).toBeNull();
    expect(localStorage.getItem('examprep.refreshToken')).toBeNull();
  });
});
