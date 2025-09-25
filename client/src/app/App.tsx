import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from '@pages/main';
import { withRouter, withAntd } from './providers';
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import '../App.css';

const AppComponent: React.FC = () => {
  // Регистрируем Service Worker для PWA
  useServiceWorker();

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/main' element={<MainPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  );
};

export const App = withAntd(withRouter(() => <AppComponent />));
