import React, { useState } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useObjectTasks, ObjectTask } from '../../../shared/api/chatApi';
import styles from './ChatTasks.module.css';

// Собственные компоненты для замены Ant Design
interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  children: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({
  level = 5,
  className = '',
  children,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={`${styles.title} ${styles[`titleLevel${level}`]} ${className}`}
    >
      {children}
    </Tag>
  );
};

interface TextProps {
  type?: 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  type = 'default',
  className = '',
  children,
}) => {
  const typeClass =
    type !== 'default'
      ? styles[`text${type.charAt(0).toUpperCase() + type.slice(1)}`]
      : '';
  return (
    <span className={`${styles.text} ${typeClass} ${className}`}>
      {children}
    </span>
  );
};

interface ButtonProps {
  type?: 'text' | 'primary' | 'default';
  size?: 'small' | 'default' | 'large';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'default',
  icon,
  onClick,
  className = '',
  children,
}) => {
  const typeClass =
    type !== 'default'
      ? styles[`button${type.charAt(0).toUpperCase() + type.slice(1)}`]
      : '';
  const sizeClass =
    size !== 'default'
      ? styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`]
      : '';

  return (
    <button
      className={`${styles.button} ${typeClass} ${sizeClass} ${className}`}
      onClick={onClick}
    >
      {icon && <span className={styles.buttonIcon}>{icon}</span>}
      {children && <span className={styles.buttonText}>{children}</span>}
    </button>
  );
};

// Компонент спиннера
const Spin: React.FC<{ size?: 'small' | 'default' | 'large' }> = ({
  size = 'default',
}) => {
  const sizeClass =
    size !== 'default'
      ? styles[`spin${size.charAt(0).toUpperCase() + size.slice(1)}`]
      : '';
  return (
    <div className={`${styles.spin} ${sizeClass}`}>
      <div className={styles.spinDot}></div>
    </div>
  );
};

// Компонент уведомления
interface AlertProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  message,
  type = 'info',
  showIcon = false,
}) => {
  return (
    <div
      className={`${styles.alert} ${styles[`alert${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
    >
      {showIcon && <div className={styles.alertIcon}>!</div>}
      <div className={styles.alertMessage}>{message}</div>
    </div>
  );
};

interface ChatTasksProps {
  objectId: string;
}

export const ChatTasks: React.FC<ChatTasksProps> = ({ objectId }) => {
  const { data: tasks = [], isLoading, error } = useObjectTasks(objectId);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.tasksCard}>
        <div className={styles.loadingContainer}>
          <Spin size='small' />
          <Text type='secondary'>Загрузка задач...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tasksCard}>
        <Alert
          message='Ошибка загрузки задач'
          type='error'
          // size='small'
          showIcon
        />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.tasksCard}>
        <div className={styles.emptyState}>
          <Text type='secondary'>Нет задач</Text>
        </div>
      </div>
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
    <div className={styles.tasksCard}>
      <div className={styles.tasksHeader}>
        <Title level={5} className={styles.tasksTitle}>
          Общий чек-лист
        </Title>
        <Button
          type='text'
          size='small'
          icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseButton}
        />
      </div>

      {!isCollapsed && (
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
      )}
    </div>
  );
};
