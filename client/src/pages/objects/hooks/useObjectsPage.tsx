import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Tag, Progress, Button, Space } from 'antd';
import {
  AppstoreOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { mockObjects } from '@shared/api/mockData';
import { ObjectData } from '../model/types';
import styles from '../ui/ObjectsPage.module.css';

export const useObjectsPage = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const handleEdit = (objectId: string) => {
    console.log('Edit object:', objectId);
    navigate(`/objects/${objectId}/edit`);
  };

  const handleChat = (objectId: string) => {
    console.log('Open chat for object:', objectId);
    // TODO: Реализовать редирект к чату
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    console.log('Search:', value);
    // TODO: Реализовать поиск по объектам
  };

  const handleFilter = () => {
    console.log('Open filter modal');
    // TODO: Реализовать открытие модального окна фильтров
  };

  const handleSort = () => {
    console.log('Open sort options');
    // TODO: Реализовать открытие опций сортировки
  };

  const handleCreateObject = () => {
    navigate('/objects/create');
  };

  const columns: ColumnsType<ObjectData> = [
    {
      title: 'Название объекта',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AppstoreOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color='blue' icon={<AppstoreOutlined />}>
          {type === 'project' ? 'Проект' : type}
        </Tag>
      ),
    },
    {
      title: 'Прогресс',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size='small'
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Ответственный',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee: string) => assignee || 'Не назначен',
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => {
        const isCompleted = record.progress === 100;
        const isInProgress = record.progress > 0 && record.progress < 100;

        if (isCompleted) {
          return <Tag color='green'>Завершен</Tag>;
        }
        if (isInProgress) {
          return <Tag color='blue'>В работе</Tag>;
        }
        return <Tag color='default'>Планируется</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      className: styles.actionsColumn,
      render: (_, record) => (
        <Space size='small'>
          <Button
            type='primary'
            icon={<EditOutlined />}
            size='small'
            onClick={() => handleEdit(record.id)}
          >
            Редактировать
          </Button>
          <Button
            type='default'
            icon={<MessageOutlined />}
            size='small'
            onClick={() => handleChat(record.id)}
          >
            К чату
          </Button>
        </Space>
      ),
    },
  ];

  return {
    searchText,
    columns,
    dataSource: mockObjects,
    handleSearch,
    handleFilter,
    handleSort,
    handleCreateObject,
  };
};
