import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { apiClient, ApiError, ObjectData } from '@shared/api/client';
import type {
  ObjectChecklistType,
  ChecklistItem,
} from '@features/object-checklist';

export const useObjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objectData, setObjectData] = useState<ObjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [checklist, setChecklist] = useState<ObjectChecklistType | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Загрузка данных с бэкенда
    const loadObject = async () => {
      setLoading(true);
      try {
        const foundObject = await apiClient.getObjectById(id!);

        setObjectData(foundObject);
        setName(foundObject.name);
        setAssignee(foundObject.assignee || '');

        // TODO: Загрузить чеклист для объекта через API
        setChecklist(null);
      } catch (error) {
        console.error('Ошибка при загрузке объекта:', error);

        if (error instanceof ApiError) {
          message.error(`Ошибка: ${error.message}`);
        } else {
          message.error('Ошибка при загрузке данных объекта');
        }

        setObjectData(null);
        setChecklist(null);
      } finally {
        setLoading(false);
      }
    };

    loadObject();
  }, [id]);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleAssigneeChange = (value: string | undefined) => {
    setAssignee(value || '');
  };

  const handleSave = async () => {
    if (!objectData) return;

    try {
      console.log('Сохранение объекта:', {
        name,
        assignee,
      });

      // Отправляем запрос на бэкенд
      const updatedObject = await apiClient.updateObject(objectData.id, {
        name,
        assignee,
      });

      console.log('Объект обновлен:', updatedObject);
      message.success('Объект успешно сохранен');

      // Возвращаемся к списку объектов
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при сохранении объекта:', error);

      if (error instanceof ApiError) {
        message.error(`Ошибка: ${error.message}`);
      } else {
        message.error('Ошибка при сохранении объекта');
      }
    }
  };

  const handleBack = () => {
    navigate('/objects');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!checklist) return;

    const updatedItems = checklist.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date() : undefined,
        };
      }
      return item;
    });

    setChecklist({
      ...checklist,
      items: updatedItems,
      updatedAt: new Date(),
    });
  };

  const handleAddChecklistItem = () => {
    if (!checklist) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: 'Новая задача',
      completed: false,
      createdAt: new Date(),
    };

    setChecklist({
      ...checklist,
      items: [...checklist.items, newItem],
      updatedAt: new Date(),
    });
  };

  const handleEditChecklistItem = (itemId: string) => {
    if (!checklist) return;

    const newText = prompt('Введите новый текст задачи:');
    if (newText && newText.trim()) {
      const updatedItems = checklist.items.map(item => {
        if (item.id === itemId) {
          return { ...item, text: newText.trim() };
        }
        return item;
      });

      setChecklist({
        ...checklist,
        items: updatedItems,
        updatedAt: new Date(),
      });
    }
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!checklist) return;

    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      const updatedItems = checklist.items.filter(item => item.id !== itemId);
      setChecklist({
        ...checklist,
        items: updatedItems,
        updatedAt: new Date(),
      });
    }
  };

  return {
    objectData,
    loading,
    name,
    assignee,
    checklist,
    handleNameChange,
    handleAssigneeChange,
    handleSave,
    handleBack,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
  };
};
