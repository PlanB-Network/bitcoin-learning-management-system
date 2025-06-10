import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app.tsx';
import { AppProvider } from './providers/app.tsx';
import './utils/i18n';
import OrangePill from '#src/assets/icons/footer_pill.webp?no-inline';

import '../../../packages/ui/src/styles/global.css';

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
