import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import { initializeTheme } from './utils/themeColors';
import App from './App';
// Import Firebase config to initialize it
import './services/firebaseConfig';

// Initialize theme BEFORE React renders to ensure HTML element has data-theme attribute
initializeTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);