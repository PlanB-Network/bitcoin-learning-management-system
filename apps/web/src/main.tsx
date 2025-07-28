import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app.tsx';
import { AppProvider } from './providers/app.tsx';
import './utils/i18n';
import OrangePill from '#src/assets/icons/footer_pill.webp?no-inline';

import '../../../packages/ui/src/styles/global.css';
import { customToast } from '@blms/ui';
import { t } from 'i18next';

const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Suspense
      fallback={
        <img
          src={OrangePill}
          className="w-[200px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          loading="lazy"
          alt="Orange pill"
        />
      }
    >
      <AppProvider>
        <App />
      </AppProvider>
    </Suspense>
  </StrictMode>,
);

let refreshing = false;

// The event listener that is fired when the service worker updates
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  window.location.reload();
  refreshing = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  customToast(t('notifications.newVersionAvailable'), {
                    color: 'primary',
                    time: 5000,
                    closeButton: false,
                    onClick: () => {
                      installingWorker?.postMessage({ action: 'skipWaiting' });
                    },
                  });
                }
              }
            };
          }
        };
      })
      .catch((error) =>
        console.error('Service Worker registration failed:', error),
      );
  });
}
