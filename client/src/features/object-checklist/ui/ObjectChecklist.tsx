import React, { useState } from 'react';
import { Card, Checkbox, Button, Typography, Progress, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChecklistItem, ObjectChecklistProps } from '../model/types';
import { useObjectChecklist } from '../hooks/useObjectChecklist';
import { CreateTaskModal, CreateTaskFormData } from './CreateTaskModal';
import { EditTaskModal, EditTaskFormData } from './EditTaskModal';
import styles from './ObjectChecklist.module.css';

const { Title, Text } = Typography;

export const ObjectChecklist: React.FC<ObjectChecklistProps> = ({
  checklist,
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const { progressInfo } = useObjectChecklist({ checklist });
  const { completedCount, totalCount, progressPercent } = progressInfo;

  // Убрали inline-редактирование, теперь используем модальное окно

  // Состояние для модального окна создания задачи
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Состояние для модального окна редактирования задачи
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState<{
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    priority: 'low' | 'medium' | 'high';
  } | null>(null);

  const handleStartEdit = (item: ChecklistItem) => {
    // Открываем модальное окно редактирования вместо inline-редактирования
    setEditingTaskData({
      id: item.id,
      title: item.text,
      description: '', // ChecklistItem не содержит description, но можем добавить
      priority: 'medium', // По умолчанию
    });
    setIsEditModalVisible(true);
  };

  // Убрали старые обработчики inline-редактирования

  const handleOpenCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
  };

  const handleCreateTask = async (taskData: CreateTaskFormData) => {
    // Преобразуем данные формы в формат, ожидаемый родительским компонентом
    const taskDataForParent = {
      title: taskData.title,
      description: taskData.description,
      startDate: taskData.startDate?.format('YYYY-MM-DD'),
      endDate: taskData.endDate?.format('YYYY-MM-DD'),
      priority: taskData.priority,
    };

    await onAddItem(taskDataForParent);
    setIsCreateModalVisible(false);
  };

  const handleEditTask = async (taskData: EditTaskFormData) => {
    if (!editingTaskData) return;

    // Преобразуем данные формы в формат, ожидаемый родительским компонентом
    const taskDataForParent = {
      title: taskData.title,
      description: taskData.description,
      startDate: taskData.startDate?.format('YYYY-MM-DD'),
      endDate: taskData.endDate?.format('YYYY-MM-DD'),
      priority: taskData.priority,
    };

    await onEditItem(editingTaskData.id, taskDataForParent);
    setIsEditModalVisible(false);
    setEditingTaskData(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setEditingTaskData(null);
  };

  return (
    <Card className={styles.checklistCard}>
      <div className={styles.checklistHeader}>
        <Title level={4} className={styles.checklistTitle}>
          {checklist.title}
        </Title>
        <div className={styles.progressInfo}>
          <Text type='secondary'>
            {completedCount} из {totalCount} задач
          </Text>
          <Progress
            percent={progressPercent}
            size='small'
            status={progressPercent === 100 ? 'success' : 'active'}
            className={styles.progress}
          />
        </div>
      </div>

      <Divider className={styles.divider} />

      <div className={styles.checklistItems}>
        {checklist.items.map((item: ChecklistItem) => (
          <div key={item.id} className={styles.checklistItem}>
            <div className={styles.itemContent}>
              <Checkbox
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                className={styles.checkbox}
              >
                <span
                  className={`${styles.itemText} ${
                    item.completed ? styles.completedText : ''
                  }`}
                >
                  {item.text}
                </span>
              </Checkbox>
              {item.completed && item.completedAt && (
                <Text type='secondary' className={styles.completedDate}>
                  Выполнено: {item.completedAt.toLocaleDateString('ru-RU')}
                </Text>
              )}
            </div>
            <div className={styles.itemActions}>
              <Button
                type='text'
                size='small'
                icon={<EditOutlined />}
                onClick={() => handleStartEdit(item)}
                className={styles.actionButton}
              />
              <Button
                type='text'
                size='small'
                icon={<DeleteOutlined />}
                onClick={() => onDeleteItem(item.id)}
                className={styles.actionButton}
                danger
              />
            </div>
          </div>
        ))}
      </div>

      <Divider className={styles.divider} />

      <div className={styles.addItemSection}>
        <Button
          type='dashed'
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          className={styles.addButton}
          block
        >
          Добавить задачу
        </Button>
      </div>

      <CreateTaskModal
        visible={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        onConfirm={handleCreateTask}
      />

      <EditTaskModal
        visible={isEditModalVisible}
        onCancel={handleCloseEditModal}
        onConfirm={handleEditTask}
        initialData={editingTaskData ?? undefined}
      />
    </Card>
  );
};
