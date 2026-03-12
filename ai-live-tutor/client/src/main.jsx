/**
 * Entry point for the React app.
 *
 * - ReactDOM.createRoot: attaches the React tree to the #root div
 * - StrictMode: helps catch common mistakes during development
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
