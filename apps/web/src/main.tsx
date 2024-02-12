import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app';
import { AppProvider } from './providers/app';
// Internationalization
import './utils/i18n';

// Styles
// TODO TRIGGER
// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../packages/ui/src/styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
