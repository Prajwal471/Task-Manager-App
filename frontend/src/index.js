import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import usePushSubscription from './hooks/usePushSubscription';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <BrowserRouter>
      <App />
   </BrowserRouter>
  </React.StrictMode>
);

// Lightweight auto-register (will only attempt subscription if user info is present in localStorage)
try {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    // mount a tiny invisible component to run the hook
    const PushRoot = () => { usePushSubscription(user); return null; };
    const pushContainer = document.createElement('div');
    document.body.appendChild(pushContainer);
    ReactDOM.createRoot(pushContainer).render(<PushRoot />);
  }
} catch (e) { console.warn('Push subscription initialization skipped:', e); }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
