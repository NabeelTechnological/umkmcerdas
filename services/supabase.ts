// This file is repurposed as a generic API client.

const API_BASE_URL = '/api'; // Assuming backend is served from the same domain under /api

interface ApiFetchOptions extends RequestInit {
  body?: any;
}

export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}) => {
  const token = localStorage.getItem('umkm-app-token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
        errorData = await response.json();
    } catch(e) {
        errorData = { message: 'An unexpected error occurred on the server.' };
    }
    // Throw an error with the message from the backend
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  // If response has no content, return success indicator
  if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
  }

  return response.json();
};
