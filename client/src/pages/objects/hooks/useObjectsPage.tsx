import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Tag, Progress, Button, Space, message } from 'antd';
import {
  AppstoreOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { apiClient, ApiError, ObjectData } from '@shared/api/client';
import styles from '../ui/ObjectsPage.module.css';

export const useObjectsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Загрузка объектов с бэкенда
  const loadObjects = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getObjects({
        search: searchText || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      setObjects(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Ошибка при загрузке объектов:', error);

      if (error instanceof ApiError) {
        message.error(`Ошибка: ${error.message}`);
      } else {
        message.error('Ошибка при загрузке объектов');
      }
    } finally {
      setLoading(false);
    }
  };

  // Загружаем объекты при монтировании и изменении параметров
  useEffect(() => {
    loadObjects();
  }, [currentPage, pageSize, searchText]);

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
    setCurrentPage(1); // Сбрасываем на первую страницу при поиске
  };

  const handleSort = () => {
    console.log('Open sort options');
    // TODO: Реализовать открытие опций сортировки
  };

  const handleCreateObject = () => {
    navigate('/objects/create');
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  const handlePageSizeChange = (_: number, size: number) => {
    setCurrentPage(1);
    setPageSize(size);
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
    dataSource: objects,
    currentPage,
    pageSize,
    loading,
    total,
    handleSearch,
    handleSort,
    handleCreateObject,
    handlePageChange,
    handlePageSizeChange,
  };
};
