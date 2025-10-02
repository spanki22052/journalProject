import React, { useState } from 'react';
import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { MessageType, CheckListType } from '@shared/api';
import styles from './Chat.module.css';

// Собственный компонент аватара
interface AvatarProps {
  src?: string;
  children?: React.ReactNode;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  children,
  size = 'default',
  className = '',
}) => {
  const sizeClass =
    size === 'small'
      ? styles.avatarSmall
      : size === 'large'
        ? styles.avatarLarge
        : styles.avatarDefault;

  return (
    <div className={`${styles.avatar} ${sizeClass} ${className}`}>
      {src ? (
        <img src={src} alt='Avatar' className={styles.avatarImage} />
      ) : (
        <span className={styles.avatarText}>{children}</span>
      )}
    </div>
  );
};

// Собственный компонент кнопки
interface ButtonProps {
  type?: 'primary' | 'default';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  icon,
  onClick,
  className = '',
  children,
}) => {
  const buttonClass =
    type === 'primary' ? styles.buttonPrimary : styles.buttonDefault;

  return (
    <button
      className={`${styles.button} ${buttonClass} ${className}`}
      onClick={onClick}
    >
      {icon && <span className={styles.buttonIcon}>{icon}</span>}
      <span className={styles.buttonText}>{children}</span>
    </button>
  );
};

interface ChatProps {
  messages: MessageType[];
  currentUserId?: string | number;
  checkListItems: CheckListType[];
}

export const Chat: React.FC<ChatProps> = ({ messages, currentUserId = 1 }) => {
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
    console.log('Button clicked:', title);
    // TODO: Добавить логику для обработки кнопок
  };

  return (
    <div className={styles.chatCard}>
      <div className={styles.chatHeader}>
        <h3 className={styles.chatTitle}>Чат</h3>
      </div>
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

      {/* TODO: Добавить CheckListSelector компонент */}
    </div>
  );
};
