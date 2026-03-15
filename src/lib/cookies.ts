// Cookie management utilities for authentication

export function setAuthToken(token: string) {
  // Set both localStorage and cookie for compatibility
  localStorage.setItem('auth_token', token);

  // Set cookie that expires in 7 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function getAuthToken(): string | null {
  // Try localStorage first (for client-side)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeAuthToken() {
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }

  // Remove cookie by setting expiration to past date
  document.cookie =
    'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
