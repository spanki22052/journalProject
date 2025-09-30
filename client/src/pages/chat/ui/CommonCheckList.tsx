import React, { useState } from 'react';
import { List, Tag, Card, Typography, Checkbox } from 'antd';
import { CheckListType } from '@shared/api';
import styles from './CommonCheckList.module.css';

const { Text } = Typography;

interface CommonCheckListProps {
  checkListItems: CheckListType[];
  onSelectionChange?: (selectedItems: (string | number)[]) => void;
}

export const CommonCheckList: React.FC<CommonCheckListProps> = ({
  checkListItems,
  onSelectionChange,
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set()
  );
  const getStatusColor = (status: CheckListType['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'underApproval':
        return 'processing';
      case 'approved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: CheckListType['status']) => {
    switch (status) {
      case 'open':
        return 'Открыто';
      case 'underApproval':
        return 'На рассмотрении';
      case 'approved':
        return 'Одобрено';
      default:
        return status;
    }
  };

  const handleItemSelect = (itemId: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);

    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  return (
    <Card title='Общий чек-лист' className={styles.checkListCard}>
      <List
        className={styles.checkList}
        dataSource={checkListItems}
        renderItem={item => (
          <List.Item className={styles.checkListItem}>
            <div className={styles.itemContent}>
              <Checkbox
                checked={selectedItems.has(item.id)}
                onChange={() => handleItemSelect(item.id)}
                className={styles.checkbox}
              />
              <div className={styles.itemDetails}>
                <Text className={styles.itemText}>{item.text}</Text>
                <Tag
                  color={getStatusColor(item.status)}
                  className={styles.statusTag}
                >
                  {getStatusText(item.status)}
                </Tag>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};
