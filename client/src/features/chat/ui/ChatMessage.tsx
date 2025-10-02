import React from 'react';
import { Card, Typography, Tag, Space, Image, Button } from 'antd';
import {
  EditOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  ChatMessage as ChatMessageType,
  ObjectTask,
} from '../../../shared/api/chatApi';
import styles from './ChatMessage.module.css';

const { Text, Paragraph } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
  tasks?: ObjectTask[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  tasks = [],
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageTypeIcon = () => {
    if (message.isEditSuggestion) {
      return <EditOutlined className={styles.editIcon} />;
    }
    if (message.isCompletionConfirmation) {
      return <CheckCircleOutlined className={styles.completionIcon} />;
    }
    return <UserOutlined className={styles.userIcon} />;
  };

  const getMessageTypeTag = () => {
    if (message.isEditSuggestion) {
      return (
        <Tag color='blue' icon={<EditOutlined />}>
          Предложение правки
        </Tag>
      );
    }
    if (message.isCompletionConfirmation) {
      return (
        <Tag color='green' icon={<CheckCircleOutlined />}>
          Подтверждение выполнения
        </Tag>
      );
    }
    return null;
  };

  const getTaskInfo = () => {
    if (
      message.taskId &&
      (message.isEditSuggestion || message.isCompletionConfirmation)
    ) {
      const task = tasks.find(t => t.id === message.taskId);
      const taskName = task ? task.text : message.taskId;

      return (
        <div className={styles.taskInfo}>
          <Text type='secondary' className={styles.taskLabel}>
            По задаче: {taskName}
          </Text>
        </div>
      );
    }
    return null;
  };

  const renderFile = () => {
    if (!message.fileUrl) return null;

    const isImage =
      message.type === 'IMAGE' ||
      (message.fileName &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName));

    if (isImage) {
      return (
        <div className={styles.fileContainer}>
          <Image
            src={message.fileUrl}
            alt={message.fileName || 'Изображение'}
            className={styles.fileImage}
            preview={{
              mask: 'Просмотр',
            }}
          />
          {message.fileName && (
            <div className={styles.imageInfo}>
              <Text type='secondary' className={styles.imageName}>
                {message.fileName}
              </Text>
              {message.fileSize && (
                <Text type='secondary' className={styles.imageSize}>
                  ({formatFileSize(message.fileSize)})
                </Text>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.fileContainer}>
        <Card size='small' className={styles.fileCard}>
          <Space>
            <FileOutlined className={styles.fileIcon} />
            <div className={styles.fileInfo}>
              <Text strong>{message.fileName}</Text>
              <br />
              <Text type='secondary' className={styles.fileSize}>
                {formatFileSize(message.fileSize)}
              </Text>
            </div>
            <Button
              type='link'
              icon={<DownloadOutlined />}
              href={message.fileUrl}
              download={message.fileName}
              className={styles.downloadButton}
            />
          </Space>
        </Card>
      </div>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card
      className={`${styles.messageCard} ${
        message.isEditSuggestion
          ? styles.editSuggestion
          : message.isCompletionConfirmation
            ? styles.completionConfirmation
            : styles.regularMessage
      }`}
      size='small'
    >
      <div className={styles.messageHeader}>
        <Space align='center' size='small'>
          {getMessageTypeIcon()}
          <Text strong className={styles.author}>
            {message.author}
          </Text>
          {getMessageTypeTag()}
        </Space>
        <Text type='secondary' className={styles.timestamp}>
          {formatTime(message.createdAt)}
        </Text>
      </div>

      {getTaskInfo()}

      <div className={styles.messageContent}>
        <Paragraph className={styles.content}>{message.content}</Paragraph>
        {renderFile()}
      </div>
    </Card>
  );
};
