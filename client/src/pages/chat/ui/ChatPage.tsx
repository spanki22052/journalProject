import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Chat } from '../../../features/chat/ui/Chat';
import styles from './ChatPage.module.css';

const { Content } = Layout;
const { Title } = Typography;
export const ChatPage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();

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
      <Content className={styles.content}>
        <div className={styles.chatPageContainer}>
          <Chat objectId={objectId} author={currentUser} />
        </div>
      </Content>
    </Layout>
  );
};
