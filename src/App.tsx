import React from 'react';
import AppRouter from './app/router';
import './styles/global.scss';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import GlobalErrorListeners from './components/ErrorBoundary/GlobalErrorListeners';
import GlobalErrorModal from './components/ErrorBoundary/GlobalErrorModal';

function App() {
  return (
    <ErrorBoundary>
      <GlobalErrorListeners />
      <AppRouter />
      <GlobalErrorModal />
    </ErrorBoundary>
  );
}

export default App;
