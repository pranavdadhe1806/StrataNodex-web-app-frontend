// Shared localStorage keys — must match the landing page (sn_token / sn_user)
// so that a login on localhost:3001 is immediately recognised here on :5173.
const TOKEN_KEY = 'sn_token';
const USER_KEY = 'sn_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Notify landing page navbar if open in same browser
  window.dispatchEvent(new Event('sn_auth_change'));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getStoredUser(): { name?: string; email: string } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: { name?: string; email: string }): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('sn_auth_change'));
}
