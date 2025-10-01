import React, { useState } from 'react';
import { Avatar, Card, Button } from 'antd';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { MessageType, CheckListType } from '@shared/api';
import { CheckListSelector } from '@pages/chat';
import styles from './Chat.module.css';

interface ChatProps {
  messages: MessageType[];
  currentUserId?: string | number;
  checkListItems: CheckListType[];
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  currentUserId = 1,
  checkListItems,
}) => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorTitle, setSelectorTitle] = useState('');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCurrentUser = (senderId: string | number) => {
    return senderId === currentUserId;
  };

  const handleButtonClick = (title: string) => {
    setSelectorTitle(title);
    setSelectorVisible(true);
  };

  const handleSelectorClose = () => {
    setSelectorVisible(false);
  };

  const handleSelectorSubmit = (selectedItems: (string | number)[]) => {
    console.log('Selected items:', selectedItems);
    console.log('Action:', selectorTitle);
    // Здесь можно добавить логику отправки данных
  };

  return (
    <Card title='Чат' className={styles.chatCard}>
      <div className={styles.messagesContainer}>
        {messages.map(message => {
          const isOwn = isCurrentUser(message.sender.id);
          return (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : styles.otherMessage}`}
            >
              {!isOwn && (
                <Avatar
                  src={message.sender.avatar}
                  className={styles.avatar}
                  size='small'
                >
                  {message.sender.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
              <div
                className={`${styles.messageBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
              >
                {!isOwn && (
                  <div className={styles.senderName}>{message.sender.name}</div>
                )}
                {/* Контент сообщения */}
                <div className={styles.messageContent}>{message.title}</div>

                {/* Карточка задачи, если это MessageType с метаданными */}
                {'taskId' in (message as MessageType) && (
                  <div className={styles.taskCard}>
                    <div className={styles.taskHeader}>Выполнено задание</div>
                    {(message as MessageType).taskName && (
                      <div className={styles.taskTitle}>
                        {(message as MessageType).taskName}
                      </div>
                    )}
                    {(message as MessageType).recognizedInfo && (
                      <div className={styles.recognizedBlock}>
                        <div className={styles.recognizedTitle}>
                          Распознанная информация
                        </div>
                        <div className={styles.recognizedText}>
                          {(message as MessageType).recognizedInfo}
                        </div>
                      </div>
                    )}
                    {!!(message as MessageType).files?.length && (
                      <div className={styles.filesGrid}>
                        {(message as MessageType).files!.map((src, idx) => (
                          <img
                            key={idx}
                            src={src}
                            className={styles.fileImage}
                            alt={`file-${idx}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`${styles.messageTime} ${isOwn ? styles.ownTime : styles.otherTime}`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.actionButtons}>
        <Button
          type='primary'
          icon={<CheckCircleOutlined />}
          onClick={() => handleButtonClick('Подтвердить выполнение')}
          className={styles.actionButton}
        >
          Подтвердить выполнение
        </Button>
        <Button
          icon={<EditOutlined />}
          onClick={() => handleButtonClick('Предложить правку')}
          className={styles.actionButton}
        >
          Предложить правку
        </Button>
      </div>

      <CheckListSelector
        visible={selectorVisible}
        title={selectorTitle}
        checkListItems={checkListItems}
        onClose={handleSelectorClose}
        onSubmit={handleSelectorSubmit}
      />
    </Card>
  );
};
