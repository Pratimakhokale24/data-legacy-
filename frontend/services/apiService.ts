import type { HistoryItem } from "../types";

const BASE_URL = "/api"; // Vite proxy will forward to backend

function getToken(): string | null {
  try {
    return sessionStorage.getItem('authToken');
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function register(payload: {
  email: string;
  password: string;
  companyName: string;
  companyDomain?: string;
  contactName: string;
  acceptTerms: boolean;
}): Promise<{ token: string; email: string }>{
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function login(email: string, password: string): Promise<{ token: string; email: string }>{
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getHistory(): Promise<HistoryItem[]>{
  const items = await request<any[]>('/history', { method: 'GET' });
  return items.map((doc) => ({
    id: (doc._id ?? doc.id) as string,
    title: doc.title,
    timestamp: doc.timestamp,
    legacyData: doc.legacyData,
    schema: doc.schema,
    extractedData: doc.extractedData,
  }));
}

export async function addHistoryItem(item: HistoryItem): Promise<HistoryItem>{
  const created = await request<any>('/history', {
    method: 'POST',
    body: JSON.stringify(item)
  });
  return {
    id: (created._id ?? created.id) as string,
    title: created.title,
    timestamp: created.timestamp,
    legacyData: created.legacyData,
    schema: created.schema,
    extractedData: created.extractedData,
  };
}

export async function deleteHistoryItem(id: string): Promise<void>{
  await request(`/history/${id}`, { method: 'DELETE' });
}

export async function updateHistoryItem(id: string, item: Partial<HistoryItem>): Promise<HistoryItem> {
  const updated = await request<any>(`/history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item)
  });
  return {
    id: (updated._id ?? updated.id) as string,
    title: updated.title,
    timestamp: updated.timestamp,
    legacyData: updated.legacyData,
    schema: updated.schema,
    extractedData: updated.extractedData,
  };
}