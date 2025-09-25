import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Navigation } from '@widgets/navigation';
import { ObjectsPage } from '@pages/objects';
import { MainPage } from '@pages/main';
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import { withRouter, withAntd } from './providers';
import '../App.css';

const AppComponent: React.FC = () => {
  // Регистрируем Service Worker для PWA
  useServiceWorker();

  return (
    <div className='App'>
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout.Content>
          <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path='/main' element={<MainPage />} />
            <Route path='/objects' element={<ObjectsPage />} />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export const App = withAntd(withRouter(() => <AppComponent />));
