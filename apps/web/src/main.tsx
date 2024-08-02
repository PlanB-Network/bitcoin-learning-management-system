import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import Spinner from '#src/assets/spinner_black.svg?react';

import { App } from './app.tsx';
import { AppProvider } from './providers/app.tsx';
// Internationalization
import './utils/i18n';

// Styles
// TODO TRIGGER
import '../../../packages/ui/src/styles/global.css';

const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="size-full flex flex-col justify-center items-center">
          <Spinner className="size-32 md:size-64 mx-auto" />
        </div>
      }
    >
      <AppProvider>
        <App />
      </AppProvider>
    </Suspense>
  </StrictMode>,
);
