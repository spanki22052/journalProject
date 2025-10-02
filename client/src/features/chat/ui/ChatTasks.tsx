import React from 'react';
import { Card, Typography, Checkbox, Spin, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useObjectTasks, ObjectTask } from '../../../shared/api/chatApi';
import styles from './ChatTasks.module.css';

const { Title, Text } = Typography;

interface ChatTasksProps {
  objectId: string;
}

export const ChatTasks: React.FC<ChatTasksProps> = ({ objectId }) => {
  const { data: tasks = [], isLoading, error } = useObjectTasks(objectId);

  if (isLoading) {
    return (
      <Card className={styles.tasksCard}>
        <div className={styles.loadingContainer}>
          <Spin size='small' />
          <Text type='secondary'>Загрузка задач...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={styles.tasksCard}>
        <Alert
          message='Ошибка загрузки задач'
          type='error'
          // size='small'
          showIcon
        />
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className={styles.tasksCard}>
        <div className={styles.emptyState}>
          <Text type='secondary'>Нет задач</Text>
        </div>
      </Card>
    );
  }

  const getTaskStatus = (task: ObjectTask) => {
    if (task.completed) {
      return {
        icon: <CheckCircleOutlined className={styles.completedIcon} />,
        text: 'Выполнено',
        className: styles.completedTask,
      };
    }
    return {
      icon: <ClockCircleOutlined className={styles.pendingIcon} />,
      text: 'В работе',
      className: styles.pendingTask,
    };
  };

  return (
    <Card className={styles.tasksCard}>
      <div className={styles.tasksHeader}>
        <Title level={5} className={styles.tasksTitle}>
          Общий чек-лист
        </Title>
      </div>

      <div className={styles.tasksList}>
        {tasks.map(task => {
          const status = getTaskStatus(task);
          return (
            <div
              key={task.id}
              className={`${styles.taskItem} ${status.className}`}
            >
              <div className={styles.taskContent}>
                <div className={styles.taskIcon}>{status.icon}</div>
                <div className={styles.taskText}>
                  <Text className={styles.taskTitle}>{task.text}</Text>
                  <Text type='secondary' className={styles.taskStatus}>
                    {status.text}
                  </Text>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
