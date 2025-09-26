import React from 'react';
import { Card, Checkbox, Button, Typography, Progress, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ChecklistItem,
  ObjectChecklist as ChecklistType,
} from '../model/types';
import styles from './ObjectChecklist.module.css';

const { Title, Text } = Typography;

interface ObjectChecklistProps {
  checklist: ChecklistType;
  onToggleItem: (itemId: string) => void;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ObjectChecklist: React.FC<ObjectChecklistProps> = ({
  checklist,
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const completedCount = checklist.items.filter(item => item.completed).length;
  const totalCount = checklist.items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
                onClick={() => onEditItem(item.id)}
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
          onClick={onAddItem}
          className={styles.addButton}
          block
        >
          Добавить задачу
        </Button>
      </div>
    </Card>
  );
};
