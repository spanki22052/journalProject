import React, { useState } from 'react';
import { Modal, List, Card, Typography, Checkbox, Button, Space } from 'antd';
import { ObjectTask } from '@shared/api/chatApi';
import styles from './ObjectSelector.module.css';

const { Text, Title } = Typography;

interface ObjectSelectorProps {
  visible: boolean;
  title: string;
  objectTasks: ObjectTask[];
  onClose: () => void;
  onSubmit: (selectedTasks: string[]) => void;
}

export const ObjectSelector: React.FC<ObjectSelectorProps> = ({
  visible,
  title,
  objectTasks,
  onClose,
  onSubmit,
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedTasks));
    setSelectedTasks(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedTasks(new Set());
    onClose();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>Отмена</Button>
          <Button type='primary' onClick={handleSubmit}>
            Подтвердить
          </Button>
        </Space>
      }
      width={600}
      className={styles.selectorModal}
    >
      <Card className={styles.tasksCard}>
        <List
          className={styles.tasksList}
          dataSource={objectTasks}
          renderItem={task => (
            <List.Item className={styles.taskItem}>
              <div className={styles.taskContent}>
                <Checkbox
                  checked={selectedTasks.has(task.id)}
                  onChange={() => handleTaskSelect(task.id)}
                  className={styles.checkbox}
                />
                <div className={styles.taskDetails}>
                  <Text className={styles.taskText}>{task.text}</Text>
                  <div className={styles.taskStatus}>
                    <Text type={task.completed ? 'success' : 'secondary'}>
                      {task.completed ? 'Выполнено' : 'В процессе'}
                    </Text>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </Modal>
  );
};
