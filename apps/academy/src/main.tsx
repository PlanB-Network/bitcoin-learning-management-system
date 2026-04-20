import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { AppProvider } from './providers/app.tsx';
import './utils/i18n';
import OrangePill from '#src/assets/icons/loading_pill.svg';

import '../../../packages/ui/src/styles/global.css';
import { isPearApp } from './env.ts';

const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);

interface Pear {
  versions: () => Promise<{ runtimes: { pear: string; bare: string } }>;
  updates: (callback: () => void) => void;
  reload: () => void;
  config: any;
}

declare global {
  const Pear: Pear | undefined;

  interface Window {
    Pear?: Pear;
    prerenderReady?: boolean;
  }
}

// Signal prerender to wait for the app to finish rendering
window.prerenderReady = false;

// Pear update handling
if (isPearApp && typeof Pear !== 'undefined') {
  document.body.classList.add('is-pear-context');

  Pear.versions().then((versions) => {
    console.log('Running in Pear context', JSON.stringify(versions, null, 2));

    const pearVersion = versions.runtimes.pear;

    // v1
    if (pearVersion?.startsWith('1')) {
      Pear.updates(() => {
        console.log('Pear (v1) update detected, reloading app...');

        setTimeout(() => Pear.reload(), 1000);
      });
    }

    // v2
    else if (pearVersion?.startsWith('2')) {
      import('pear-updates')
        .then((module) => module.default)
        .then((updates) => {
          updates(() => {
            console.log('Pear (v2) update detected, reloading app...');

            // Wait to try fix issues with reloading
            // https://docs.pears.com/pear-runtime/migration#pear
            setTimeout(() => location.reload(), 1000);
          });
        })
        .catch((err) => console.error('Failed to load pear-updates', err));
    }

    // Unknown version
    else {
      console.warn('Unknown Pear version, skipping auto updates', pearVersion);
    }
  });
}

root.render(
  <StrictMode>
    <Suspense
      fallback={
        <img
          src={OrangePill}
          className="w-[100px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          loading="lazy"
          alt="Orange pill"
        />
      }
    >
      <AppProvider>
        <div />
      </AppProvider>
    </Suspense>
  </StrictMode>,
);

// The event listener that is fired when the service worker updates
// navigator.serviceWorker.addEventListener('controllerchange', (e) => {
//   customToast(t('notifications.newVersionAvailable'), {
//     color: 'primary',
//     time: 10000,
//     closeButton: false,
//     onClick: () => {
//       window.location.reload();
//     },
//   });
// });

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/service-worker.js')
//       .then((registration) => {
//         setInterval(() => {
//           registration.update();
//         }, 10 * 1000);
//       })
//       .catch((error) =>
//         console.error('Service Worker registration failed:', error),
//       );
//   });
// }
