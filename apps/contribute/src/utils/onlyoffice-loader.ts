export const loadDocsAPI = (() => {
  // Cached promise so multiple callers share the same loading process
  let promise: Promise<void> | null = null;

  return function loadDocsAPI(): Promise<void> {
    // If DocsAPI is already on window, resolve immediately
    if (typeof (window as any).DocsAPI !== 'undefined') {
      return Promise.resolve();
    }

    // Re-use the same promise if loading is already in progress
    if (promise) return promise;

    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      // Allow override via env var, otherwise default to localhost path (dev)
      const src =
        (import.meta as any).env?.VITE_ONLYOFFICE_API_URL ??
        'http://localhost/web-apps/apps/api/documents/api.js';
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => {
        // Reset cached promise so callers can retry if desired
        promise = null;
        reject(
          err instanceof Error ? err : new Error('Failed to load DocsAPI'),
        );
      };
      document.head.appendChild(script);
    });

    return promise;
  };
})();
