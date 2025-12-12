import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Function to set a custom favicon
const setFavicon = (faviconPath) => {
  const link = document.querySelector("link[rel~='icon']");
  if (!link) {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = faviconPath;
    document.head.appendChild(newLink);
  } else {
    link.href = faviconPath;
  }
};

// Set your custom favicon here
setFavicon('/images/MK.png'); // The path relative to the public directory

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();