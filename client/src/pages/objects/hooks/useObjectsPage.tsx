import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { Tag, Progress, Button, Space } from 'antd';
import {
  AppstoreOutlined,
  EditOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useObjects } from '@entities/object/api/objectApi';
import { ObjectData } from '../model/types';
import styles from '../ui/ObjectsPage.module.css';

export const useObjectsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Параметры для API запроса
  const searchParams = useMemo(
    () => ({
      search: searchText || undefined,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    }),
    [searchText, pageSize, currentPage]
  );

  // Получаем данные через API
  const {
    data: objectsResponse,
    isLoading,
    error,
    refetch,
  } = useObjects(searchParams);

  const handleEdit = (objectId: string) => {
    console.log('Edit object:', objectId);
    navigate(`/objects/${objectId}/edit`);
  };

  const handleChat = (objectId: string) => {
    navigate(`/chats/${objectId}`);
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

  // Преобразуем данные API в формат, ожидаемый компонентом
  const dataSource: ObjectData[] = useMemo(() => {
    if (!objectsResponse?.data) return [];

    return objectsResponse.data.map(apiObject => ({
      id: apiObject.id,
      name: apiObject.name,
      startDate: new Date(apiObject.startDate),
      endDate: new Date(apiObject.endDate),
      progress: apiObject.progress,
      type: apiObject.type.toLowerCase() as 'project' | 'task' | 'subtask',
      assignee: apiObject.assignee,
      isExpanded: apiObject.isExpanded,
    }));
  }, [objectsResponse?.data]);

  // Общее количество объектов для пагинации
  const totalObjects = objectsResponse?.total || 0;

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
    dataSource,
    currentPage,
    pageSize,
    totalObjects,
    isLoading,
    error,
    handleSearch,
    handleSort,
    handleCreateObject,
    handlePageChange,
    handlePageSizeChange,
    refetch,
  };
};
