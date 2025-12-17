import type { HeadersInit } from './apiService';

const BASE_URL = "/api";

function getToken(): string | null {
  try { return sessionStorage.getItem('authToken'); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) { (headers as any)['Authorization'] = `Bearer ${token}`; }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export type UserProfile = {
  email: string;
  companyName: string;
  companyDomain?: string;
  contactName: string;
  acceptedTermsAt?: string;
  createdAt: string;
};

export async function getMe(): Promise<UserProfile> {
  // Try full profile first; if the route is unavailable, fall back to auth/me
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) { (headers as any)['Authorization'] = `Bearer ${token}`; }
  // Primary endpoint
  try {
    const res = await fetch(`${BASE_URL}/users/me`, { method: 'GET', headers });
    if (res.ok) {
      return res.json();
    }
    // If not ok, attempt fallback
  } catch (_) {
    // network error -> attempt fallback
  }
  try {
    const res2 = await fetch(`${BASE_URL}/auth/me`, { method: 'GET', headers });
    if (res2.ok) {
      const j = await res2.json().catch(() => ({ email: '' }));
      const now = new Date().toISOString();
      const profile: UserProfile = {
        email: j.email || '',
        companyName: '',
        companyDomain: '',
        contactName: '',
        createdAt: now,
        acceptedTermsAt: undefined,
      };
      return profile;
    }
    const err = await res2.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res2.status}`);
  } catch (e: any) {
    throw new Error(e?.message || 'Failed to load profile');
  }
}

export async function updateMe(profile: Partial<Pick<UserProfile, 'companyName'|'companyDomain'|'contactName'>>): Promise<UserProfile> {
  return request('/users/me', { method: 'PUT', body: JSON.stringify(profile) });
}