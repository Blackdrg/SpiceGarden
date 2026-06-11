import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from './pages/Dashboard';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<Dashboard />);
}