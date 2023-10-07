import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app';
import { AppProvider } from './providers/app';
// Internationalization
import './utils/i18n';

import './styles/global.css';

// Styles
// TODO TRIGGER
//import '@sovereign-university/ui/styles/global.css';

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
