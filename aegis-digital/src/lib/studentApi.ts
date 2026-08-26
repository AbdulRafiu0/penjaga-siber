// Shared fetch helper for student (logged-in user) API calls.
// Attaches the signed session token (from /api/login) to every request and
// redirects to /login if the server ever responds 401 (expired/invalid token).
// Centralizing this means the Authorization header can't be forgotten on some
// new student-facing fetch call later.

// In production this is an empty string, so every `${API_BASE}${path}` call
// site (this file, dashboard.tsx's plain fetch() calls, the task file link,
// etc.) resolves to a RELATIVE path. The browser then requests that path
// against the current page's own domain (penjagasiber.cc.cd) instead of the
// raw workers.dev URL — and Cloudflare Pages' _redirects file transparently
// proxies anything under /api/* to this same Worker behind the scenes, so
// students never see it.
//
// In local dev there is no Pages proxy in front of Vite, so this still
// points at the deployed Worker directly (already allowed by the Worker's
// CORS origin list for http://localhost:5173).
export const API_BASE = import.meta.env.DEV
  ? 'https://aegis-api.rafiuraza474.workers.dev'
  : '';

const TOKEN_KEY = 'aegis_token';

export function getStudentToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStudentToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStudentSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('aegis_userId');
  localStorage.removeItem('aegis_user');
}

/**
 * Wraps fetch() for authenticated student API calls. Prepends API_BASE if
 * given a relative path, attaches `Authorization: Bearer <token>`, and — on
 * a 401 — clears the session and sends the user back to /login.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStudentToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearStudentSession();
    window.location.href = '/login?expired=true';
  }

  return response;
}