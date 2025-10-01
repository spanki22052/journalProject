import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { Navigation } from '@widgets/navigation';
import { ObjectsPage } from '@pages/objects';
import { MainPage } from '@pages/main';
import { ObjectEditPage } from '@pages/object-edit';
import { ObjectCreatePage } from '@pages/object-create';
import { ChatPageContainer } from '@pages/chat';
import { ChatsListPage } from '@pages/chats';
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import { withRouter, withAntd, withQuery } from './providers';
import '../App.css';

const AppComponent: React.FC = () => {
  // Регистрируем Service Worker для PWA
  useServiceWorker();

  const LoadingFallback = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <Spin size='large' />
    </div>
  );

  return (
    <div className='App'>
      <Layout style={{ minHeight: '100vh' }}>
        <Suspense fallback={<LoadingFallback />}>
          <Navigation />
        </Suspense>
        <Layout.Content>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path='/' element={<MainPage />} />
              <Route path='/main' element={<MainPage />} />
              <Route path='/objects' element={<ObjectsPage />} />
              <Route path='/objects/create' element={<ObjectCreatePage />} />
              <Route path='/objects/:id/edit' element={<ObjectEditPage />} />
              <Route path='/chats' element={<ChatsListPage />} />
              <Route path='/chats/:objectId' element={<ChatPageContainer />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Suspense>
        </Layout.Content>
      </Layout>
    </div>
  );
};

export const App = withQuery(withAntd(withRouter(() => <AppComponent />)));
