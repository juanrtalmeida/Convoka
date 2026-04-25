import { hc } from 'hono/client';
import type { AppType } from '../../../api/src/index';

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('@convoka:token');
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

export const apiClient = hc<AppType>('/', {
  fetch: customFetch,
});
