import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { setupApiClient } from './services/apiClient';

// Inject the store into the API client
setupApiClient(store);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
