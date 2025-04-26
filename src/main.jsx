import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Asegúrate de que la ruta sea correcta

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);