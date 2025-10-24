// src/components/ErrorBoundary.tsx
import React from 'react';

const RELOAD_ATTEMPT_KEY = 'chunkReloadAttempted';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading module') ||
      error.message.includes('disallowed MIME type');

    if (isChunkLoadError) {
      const hasReloaded = sessionStorage.getItem(RELOAD_ATTEMPT_KEY);

      if (hasReloaded === 'true') {
        sessionStorage.removeItem(RELOAD_ATTEMPT_KEY);
        return { hasError: true };
      }
      sessionStorage.setItem(RELOAD_ATTEMPT_KEY, 'true');
      window.location.reload();
      return { hasError: false };
    }

    return { hasError: true };
  }

  override componentDidMount() {
    sessionStorage.removeItem(RELOAD_ATTEMPT_KEY);
  }

  override render() {
    if (this.state.hasError) {
      // Fallback UI for a failed reload or other errors
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <p className="my-4">
            We've updated the application. Please refresh the page to continue.
          </p>
          <button
            type="button"
            className="rounded bg-orange-500 px-4 py-2 text-white"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
