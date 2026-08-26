// Since Cloudflare routes /api/* directly to your worker, 
// leaving API_BASE empty makes all requests use your clean domain name!
export const API_BASE = "";

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('aegis_token') || sessionStorage.getItem('aegis_token');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
}

export async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return { success: false, message: 'Invalid server response format.' };
  }
}

export function getStudentToken() {
  return localStorage.getItem('aegis_token') || sessionStorage.getItem('aegis_token');
}