import React from 'react';
import {
  Typography,
  Card,
  List,
  Badge,
  Button,
  Space,
  Spin,
  Alert,
} from 'antd';
import { MessageOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useAllChats } from '../../../shared/api/chatApi';
import { useNavigate } from 'react-router-dom';
import styles from './ChatsListPage.module.css';

const { Title, Text } = Typography;

export const ChatsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: chats = [], isLoading, error, refetch } = useAllChats();

  const handleOpenChat = (objectId: string) => {
    navigate(`/chats/${objectId}`);
  };

  const handleShowOnDiagram = (objectId: string) => {
    // TODO: Реализовать показ на диаграмме
    console.log('Show on diagram:', objectId);
  };

  const handleEdit = (objectId: string) => {
    navigate(`/objects/${objectId}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size='large' />
        <Text type='secondary'>Загрузка чатов...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Alert
          message='Ошибка загрузки чатов'
          description='Не удалось загрузить список чатов'
          type='error'
          showIcon
          action={
            <Button size='small' onClick={() => refetch()}>
              Попробовать снова
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Чаты
        </Title>
      </div>

      <div className={styles.content}>
        {chats.length === 0 ? (
          <Card className={styles.emptyCard}>
            <div className={styles.emptyState}>
              <MessageOutlined className={styles.emptyIcon} />
              <Title level={4} type='secondary'>
                Нет чатов
              </Title>
              <Text type='secondary'>
                Создайте объект, чтобы начать обсуждение
              </Text>
            </div>
          </Card>
        ) : (
          <List
            dataSource={chats}
            renderItem={chat => (
              <List.Item className={styles.chatItem}>
                <Card className={styles.chatCard} hoverable>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatInfo}>
                      <Title level={4} className={styles.chatTitle}>
                        {chat.objectName}
                      </Title>
                      <Text type='secondary' className={styles.chatDate}>
                        Обновлен: {formatDate(chat.updatedAt)}
                      </Text>
                    </div>
                    <div className={styles.chatStats}>
                      <Badge count={chat.unreadCount} size='small'>
                        <MessageOutlined className={styles.messageIcon} />
                      </Badge>
                    </div>
                  </div>

                  <div className={styles.chatActions}>
                    <Space>
                      <Button
                        type='primary'
                        icon={<MessageOutlined />}
                        onClick={() => handleOpenChat(chat.objectId)}
                        className={styles.actionButton}
                      >
                        Открыть чат
                      </Button>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleShowOnDiagram(chat.objectId)}
                        className={styles.actionButton}
                      >
                        Показать на диаграмме
                      </Button>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(chat.objectId)}
                        className={styles.actionButton}
                      >
                        Редактировать
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};
