import React, { useState } from 'react';
import {
  Card,
  Checkbox,
  Button,
  Typography,
  Progress,
  Divider,
  Input,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { ChecklistItem, ObjectChecklistProps } from '../model/types';
import { useObjectChecklist } from '../hooks/useObjectChecklist';
import { CreateTaskModal, CreateTaskFormData } from './CreateTaskModal';
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

  // Состояние для редактирования
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Состояние для модального окна создания задачи
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingText.trim()) {
      onEditItem(editingItemId, editingText.trim());
      setEditingItemId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
                disabled={editingItemId === item.id}
              >
                {editingItemId === item.id ? (
                  <Input
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleSaveEdit}
                    autoFocus
                    className={styles.editInput}
                    size='small'
                  />
                ) : (
                  <span
                    className={`${styles.itemText} ${
                      item.completed ? styles.completedText : ''
                    }`}
                  >
                    {item.text}
                  </span>
                )}
              </Checkbox>
              {item.completed &&
                item.completedAt &&
                editingItemId !== item.id && (
                  <Text type='secondary' className={styles.completedDate}>
                    Выполнено: {item.completedAt.toLocaleDateString('ru-RU')}
                  </Text>
                )}
            </div>
            <div className={styles.itemActions}>
              {editingItemId === item.id ? (
                <>
                  <Button
                    type='text'
                    size='small'
                    icon={<CheckOutlined />}
                    onClick={handleSaveEdit}
                    className={styles.actionButton}
                  />
                  <Button
                    type='text'
                    size='small'
                    icon={<CloseOutlined />}
                    onClick={handleCancelEdit}
                    className={styles.actionButton}
                  />
                </>
              ) : (
                <>
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
                </>
              )}
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
    </Card>
  );
};
