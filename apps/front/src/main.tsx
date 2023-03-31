import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// prime react theme & core
import './assets/css/theme-light.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// global styles
import './styles.css';

import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
