import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Ensure correct import for React 18
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("No root element found in the document!");
}
