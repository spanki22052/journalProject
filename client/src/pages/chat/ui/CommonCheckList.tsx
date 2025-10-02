import React from 'react';
import { List, Tag, Card, Typography } from 'antd';
import { CheckListType } from '@shared/api';
import styles from './CommonCheckList.module.css';

const { Text } = Typography;

interface CommonCheckListProps {
  checkListItems: CheckListType[];
}

export const CommonCheckList: React.FC<CommonCheckListProps> = ({
  checkListItems,
}) => {
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

  return (
    <Card title='Общий чек-лист' className={styles.checkListCard}>
      <List
        className={styles.checkList}
        dataSource={checkListItems}
        renderItem={item => (
          <List.Item className={styles.checkListItem}>
            <div className={styles.itemContent}>
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
