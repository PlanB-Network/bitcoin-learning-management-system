import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

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
    <Suspense fallback={<div>Loading...</div>}>
      <AppProvider>
        <App />
      </AppProvider>
    </Suspense>
  </StrictMode>,
);
