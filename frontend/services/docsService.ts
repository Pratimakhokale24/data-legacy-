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

export type DocItem = {
  _id: string;
  title: string;
  content: any;
  fileName?: string;
  keyPoints?: string[];
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export async function listDocs(): Promise<DocItem[]> {
  return request('/docs', { method: 'GET' });
}

export async function createDoc(payload: Omit<DocItem, '_id'|'createdAt'|'updatedAt'>): Promise<DocItem> {
  return request('/docs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateDoc(id: string, payload: Partial<DocItem>): Promise<DocItem> {
  return request(`/docs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteDoc(id: string): Promise<void> {
  await request(`/docs/${id}`, { method: 'DELETE' });
}