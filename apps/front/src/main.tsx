import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { client, trpc } from '@sovereign-academy/api-client';

import { App } from './App';
import { store } from './store';

// prime react theme & core
import './assets/css/theme-light.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// global styles
import './styles.css';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <trpc.Provider client={client} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </trpc.Provider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
