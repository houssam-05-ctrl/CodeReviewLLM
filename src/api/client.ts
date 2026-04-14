import type { CodeReview, HistoryEntry, AuthUser } from '../types';

const BASE_URL = '/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getToken = (): string | null => {
  const user = localStorage.getItem('crp_user');
  if (!user) return null;
  try {
    return (JSON.parse(user) as AuthUser).token;
  } catch {
    return null;
  }
};

const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${getToken()}`,
});

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || 'Request failed');
  }
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const apiRegister = async (
  username: string,
  password: string
): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<AuthUser>(res);
};

export const apiLogin = async (
  username: string,
  password: string
): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse<AuthUser>(res);
};

// ── Analysis ─────────────────────────────────────────────────────────────────

/**
 * Analyze code. Accepts either a raw string or a File object.
 * - File → multipart/form-data (field: codeFile)
 * - String → application/json (field: code)
 */
export const apiAnalyze = async (
  codeOrFile: string | File
): Promise<CodeReview> => {
  let res: Response;

  if (codeOrFile instanceof File) {
    const form = new FormData();
    form.append('codeFile', codeOrFile);
    res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
  } else {
    res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeOrFile }),
    });
  }

  return handleResponse<CodeReview>(res);
};

// ── History ──────────────────────────────────────────────────────────────────

export const apiGetHistory = async (): Promise<HistoryEntry[]> => {
  const res = await fetch(`${BASE_URL}/analyze/history`, {
    headers: authHeaders(),
  });
  return handleResponse<HistoryEntry[]>(res);
};
