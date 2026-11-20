import { NativeModules } from 'react-native';
import { getAuthHeader, clearAuth } from './auth';

const DEFAULT_HOST = '10.51.26.8';

function resolveApiHost() {
  const sourceCode = NativeModules.SourceCode;
  const scriptURL =
    sourceCode?.scriptURL || sourceCode?.getConstants?.().scriptURL;
  if (typeof scriptURL === 'string') {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
    if (match) return match[1];
  }
  return DEFAULT_HOST;
}

const API_BASE_URL = `http://${resolveApiHost()}:3002`;

const API_TIMEOUT = 15000;

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      await clearAuth();
      throw new AuthError('Unauthorized. Please log in again.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  patch: (endpoint, body) => request(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  put: (endpoint, body) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export { API_BASE_URL };
