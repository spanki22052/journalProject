import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography, Spin, message } from 'antd';
import {
  EditOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useChatByObjectId, useObjectTasks } from '../../../shared/api/chatApi';
import { ChatMessage } from './ChatMessage';
import { ChatTasks } from './ChatTasks';
import { SuggestEditModal } from './SuggestEditModal';
import { ConfirmCompletionModal } from './ConfirmCompletionModal';
import styles from './Chat.module.css';

const { Title } = Typography;

interface ChatProps {
  objectId: string;
  author: string;
}

export const Chat: React.FC<ChatProps> = ({ objectId, author }) => {
  const [isSuggestEditModalVisible, setIsSuggestEditModalVisible] =
    useState(false);
  const [isConfirmCompletionModalVisible, setIsConfirmCompletionModalVisible] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading, error, refetch } = useChatByObjectId(objectId);
  const { data: tasks = [] } = useObjectTasks(objectId);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSuggestEdit = () => {
    setIsSuggestEditModalVisible(true);
  };

  const handleConfirmCompletion = () => {
    setIsConfirmCompletionModalVisible(true);
  };

  const handleModalSuccess = () => {
    // Модальные окна уже обновят кэш через свои мутации
  };

  if (isLoading) {
    return (
      <Card className={styles.chatCard}>
        <div className={styles.loadingContainer}>
          <Spin size='large' />
          <p>Загрузка чата...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.chatCard}>
        <div className={styles.errorContainer}>
          <p>Ошибка при загрузке чата</p>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Попробовать снова
          </Button>
        </div>
      </Card>
    );
  }

  if (!chat) {
    return (
      <Card className={styles.chatCard}>
        <div className={styles.errorContainer}>
          <p>Чат не найден</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatLayout}>
        <Card className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <Title level={4} className={styles.chatTitle}>
              Чат объекта
            </Title>
          </div>

          <div className={styles.messagesContainer}>
            {chat.messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Пока нет сообщений. Начните обсуждение!</p>
              </div>
            ) : (
              chat.messages.map(message => (
                <ChatMessage key={message.id} message={message} tasks={tasks} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.actionsContainer}>
            <Space size='middle'>
              <Button
                type='default'
                icon={<EditOutlined />}
                onClick={handleSuggestEdit}
                className={styles.actionButton}
                size='large'
              >
                Предложить правку
              </Button>
              <Button
                type='primary'
                icon={<CheckCircleOutlined />}
                onClick={handleConfirmCompletion}
                className={styles.actionButton}
                size='large'
              >
                Подтвердить выполнение
              </Button>
            </Space>
          </div>
        </Card>

        <div className={styles.tasksPanel}>
          <ChatTasks objectId={objectId} />
        </div>
      </div>

      <SuggestEditModal
        visible={isSuggestEditModalVisible}
        onCancel={() => setIsSuggestEditModalVisible(false)}
        chatId={chat.id}
        objectId={objectId}
        author={author}
        onSuccess={handleModalSuccess}
      />

      <ConfirmCompletionModal
        visible={isConfirmCompletionModalVisible}
        onCancel={() => setIsConfirmCompletionModalVisible(false)}
        chatId={chat.id}
        objectId={objectId}
        author={author}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
