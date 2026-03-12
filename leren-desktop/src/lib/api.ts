const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request<T>(method: string, path: string, body?: unknown, isFormData = false): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error('Connection failed. Make sure the API is running (e.g. run the Leren API on port 4000).');
    }
    throw e;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { code: 'UNKNOWN', message: res.statusText } }));
    throw new Error(err.error?.message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

/** Fetches a binary audio response and returns a Blob (used for TTS). */
async function fetchAudio(path: string, body: unknown): Promise<Blob> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error('Connection failed. Make sure the API is running on port 4000.');
    }
    throw e;
  }
  if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, form, true),
  /** POST to a TTS endpoint; expects an audio/mpeg (or any audio) blob back. */
  tts: (path: string, body: unknown) => fetchAudio(path, body),
};
