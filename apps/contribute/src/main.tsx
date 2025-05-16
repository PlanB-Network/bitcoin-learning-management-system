import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import { Loader } from '@blms/ui';

import { App } from './app.tsx';
import { AppProvider } from './providers/app.tsx';
import './utils/i18n';

import '../../../packages/ui/src/styles/global.css';

const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);

root.render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="size-full flex flex-col justify-center items-center">
          <Loader variant="black" size={'m'} />
        </div>
      }
    >
      <AppProvider>
        <App />
      </AppProvider>
    </Suspense>
  </StrictMode>,
);
