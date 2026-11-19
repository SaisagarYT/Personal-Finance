import { supabase } from './supabase';

const DEFAULT_WORKER_URL = 'https://personal-finance-api.saisagarsylada.workers.dev/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_WORKER_URL;

export async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (e) {
    // Session token retrieval error ignored
  }
  return {};
}

export async function fetchFromApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.replace(/^\//, '');
  const url = `${normalizedBase}/${normalizedEndpoint}`;

  const authHeaders = await getAuthHeader();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const backendApi = {
  getAccounts: () => fetchFromApi<any[]>('/accounts'),
  getCategories: () => fetchFromApi<any[]>('/categories'),
  getTransactions: () => fetchFromApi<any[]>('/transactions'),
  getAnalytics: () => fetchFromApi<any>('/analytics/summary'),
  deleteTransaction: (id: string) => fetchFromApi(`/transactions/${id}`, { method: 'DELETE' }),
};

export async function checkBackendHealth() {
  try {
    const rootUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const res = await fetch(`${rootUrl}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'error', error: (err as Error).message };
  }
}
