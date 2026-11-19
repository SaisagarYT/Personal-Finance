const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchFromApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.replace(/^\//, '');
  const url = `${normalizedBase}/${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || errorBody.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function checkBackendHealth() {
  try {
    const rootUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    const res = await fetch(`${rootUrl}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'error', error: (err as Error).message };
  }
}
