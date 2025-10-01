import React, { useState } from 'react';
import { Modal, List, Checkbox, Tag, Button, Typography } from 'antd';
import { CheckListType } from '../../../shared/api/types';
import styles from './CheckListSelector.module.css';

const { Text } = Typography;

interface CheckListSelectorProps {
  visible: boolean;
  title: string;
  checkListItems: CheckListType[];
  onClose: () => void;
  onSubmit: (selectedItems: (string | number)[]) => void;
}

export const CheckListSelector: React.FC<CheckListSelectorProps> = ({
  visible,
  title,
  checkListItems,
  onClose,
  onSubmit,
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
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedItems));
    setSelectedItems(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedItems(new Set());
    onClose();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      width={600}
      className={styles.selectorModal}
      footer={
        <div className={styles.modalFooter}>
          <Button onClick={handleCancel}>Отмена</Button>
          <Button
            type='primary'
            onClick={handleSubmit}
            disabled={selectedItems.size === 0}
          >
            Подтвердить ({selectedItems.size})
          </Button>
        </div>
      }
    >
      <div className={styles.selectorContent}>
        <List
          dataSource={checkListItems}
          renderItem={item => (
            <List.Item className={styles.selectorItem}>
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
      </div>
    </Modal>
  );
};
