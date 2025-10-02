import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Chat } from '../../../features/chat/ui/Chat';
import { useAuth } from '../../../shared/lib/auth-context';
import styles from './ChatPage.module.css';

const { Title } = Typography;
export const ChatPage: React.FC = () => {
  const { id: objectId } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!objectId) {
    return (
      <div className={styles.errorContainer}>
        <Title level={3}>Ошибка</Title>
        <p>ID объекта не найден</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <Title level={3}>Ошибка</Title>
        <p>Пользователь не авторизован</p>
      </div>
    );
  }

  return (
    <Layout className={styles.layout}>
      <Chat objectId={objectId} author={user.fullName} />
    </Layout>
  );
};
