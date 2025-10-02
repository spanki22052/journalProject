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
import { LoginPage } from '@pages/auth';
import { useServiceWorker } from '@shared/lib/useServiceWorker';
import { AuthProvider, useAuth } from '@shared/lib/auth-context';
import { ProtectedRoute } from '@shared/lib/protected-route';
import { withRouter, withAntd, withQuery } from './providers';
import '../App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className='App'>
      <Layout style={{ minHeight: '100vh' }}>
        <Suspense fallback={<LoadingFallback />}>
          <Navigation />
        </Suspense>
        <Layout.Content>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route 
                path='/' 
                element={
                  <ProtectedRoute permission="view-gantt">
                    <MainPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/main' 
                element={
                  <ProtectedRoute permission="view-gantt">
                    <MainPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/objects' 
                element={
                  <ProtectedRoute permission="view-objects">
                    <ObjectsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/objects/create' 
                element={
                  <ProtectedRoute permission="create-objects">
                    <ObjectCreatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/objects/:id/edit' 
                element={
                  <ProtectedRoute permission="edit-objects">
                    <ObjectEditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/chats' 
                element={
                  <ProtectedRoute permission="view-chats">
                    <ChatsListPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path='/chats/:id' 
                element={
                  <ProtectedRoute permission="view-chats">
                    <ChatPageContainer />
                  </ProtectedRoute>
                } 
              />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Suspense>
        </Layout.Content>
      </Layout>
    </div>
  );
};

const AppComponent: React.FC = () => {
  // Регистрируем Service Worker для PWA
  useServiceWorker();

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export const App = withQuery(withAntd(withRouter(() => <AppComponent />)));
