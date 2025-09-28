import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { mockObjects, mockChecklists } from '@shared/api/mockData';
import { ObjectData } from '@pages/objects/model/types';
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

    // Имитация загрузки данных
    const loadObject = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь был бы API запрос
        const foundObject = mockObjects.find(obj => obj.id === id);

        if (foundObject) {
          setObjectData(foundObject);
          setName(foundObject.name);
          setAssignee(foundObject.assignee || '');

          // Загружаем чеклист для объекта
          const foundChecklist = mockChecklists.find(c => c.objectId === id);
          setChecklist(foundChecklist || null);
        } else {
          setObjectData(null);
          setChecklist(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке объекта:', error);
        message.error('Ошибка при загрузке данных объекта');
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
      // В реальном приложении здесь был бы API запрос для сохранения
      console.log('Сохранение объекта:', {
        ...objectData,
        name,
        assignee,
      });

      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Объект успешно сохранен');

      // Возвращаемся к списку объектов
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при сохранении объекта:', error);
      message.error('Ошибка при сохранении объекта');
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
