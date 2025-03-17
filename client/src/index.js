import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { checkEnvironmentVariables } from './utils/envCheck';

// Check environment variables in development mode
if (process.env.NODE_ENV === 'development') {
  checkEnvironmentVariables();
}

console.log(`🚀 Running in ${process.env.NODE_ENV} mode`);

const root = ReactDOM.createRoot(document.getElementById('root'));

const app = (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
);

if (process.env.NODE_ENV === "development") {
  root.render(
      <React.StrictMode>
        {app}
      </React.StrictMode>
  );
} else {
  root.render(app);
}