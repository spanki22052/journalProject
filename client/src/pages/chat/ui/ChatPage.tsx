import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Chat } from '../../../features/chat/ui/Chat';
import styles from './ChatPage.module.css';

const { Title } = Typography;
export const ChatPage: React.FC = () => {
  const { id: objectId } = useParams<{ id: string }>();

  if (!objectId) {
    return (
      <div className={styles.errorContainer}>
        <Title level={3}>Ошибка</Title>
        <p>ID объекта не найден</p>
      </div>
    );
  }

  // В реальном приложении здесь бы получали данные пользователя
  const currentUser = 'Текущий пользователь';

  return (
    <Layout className={styles.layout}>
      <Chat objectId={objectId} author={currentUser} />
    </Layout>
  );
};
