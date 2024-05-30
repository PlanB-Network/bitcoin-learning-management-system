import { baseUrl } from '#src/utils/misc.js';

export const httpClient = {
  fetch: (url: string, options?: RequestInit) => {
    const isApiUrl = !url.startsWith('http');
    const fetchUrl = isApiUrl ? `${baseUrl}${url}` : url;

    const fetchOptions: RequestInit = {
      // Include credentials for API requests
      ...(isApiUrl && { credentials: 'include' }),
      // Merge options
      ...options,
    };

    return fetch(fetchUrl, fetchOptions);
  },
  json: async <T>(url: string, options?: RequestInit) => {
    return httpClient
      .fetch(url, options)
      .then((response) => response.json() as Promise<T>);
  },
};
