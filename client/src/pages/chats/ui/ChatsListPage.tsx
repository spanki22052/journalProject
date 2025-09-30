import React, { useMemo } from 'react';
import { Card, List, Typography, Badge, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ObjectApi } from '@shared/api/types';
import styles from './ChatsListPage.module.css';

const { Text, Title } = Typography;

// Создаем 2 мок-объекта на основе ObjectApi.id
const mockObjects: Pick<ObjectApi, 'id' | 'name' | 'description'>[] = [
  {
    id: 'OBJ-1001',
    name: 'Покраска клумбы — Кулакова, 5',
    description: '2 непрочитанных события',
  },
  {
    id: 'OBJ-1002',
    name: 'Починка люка — Неманский, 11',
    description: '5 непрочитанных событий',
  },
];

export const ChatsListPage: React.FC = () => {
  const navigate = useNavigate();

  const chats = useMemo(
    () =>
      mockObjects.map(item => ({
        id: item.id,
        title: item.name,
        unreadCount: /\d+/.exec(item.description || '')?.[0] || '0',
      })),
    []
  );

  const openChat = (id: string | number) => {
    navigate(`/chats/${id}`);
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <Title level={4} className={styles.title}>
          Чаты
        </Title>
        <List
          className={styles.list}
          dataSource={chats}
          renderItem={item => (
            <List.Item
              className={styles.item}
              onClick={() => openChat(item.id)}
            >
              <div className={styles.itemLeft}>
                <Text className={styles.itemTitle}>{item.title}</Text>
                <Button
                  type='link'
                  className={styles.linkButton}
                  onClick={e => {
                    e.stopPropagation();
                    openChat(item.id);
                  }}
                >
                  показать на диаграмме
                </Button>
                <Button
                  type='link'
                  className={styles.linkButton}
                  onClick={e => e.stopPropagation()}
                >
                  редактировать
                </Button>
              </div>
              <div className={styles.itemRight}>
                <Badge count={Number(item.unreadCount)} overflowCount={99}>
                  <Text className={styles.unreadText}>
                    {item.unreadCount} непрочитанных событий
                  </Text>
                </Badge>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
