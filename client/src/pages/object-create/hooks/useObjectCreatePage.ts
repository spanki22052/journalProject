import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import type {
  ObjectChecklistType,
  ChecklistItem,
} from '@features/object-checklist';
import { CreateObjectData } from '../model/types';
import { apiClient, ApiError } from '@shared/api/client';

export const useObjectCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checklist, setChecklist] = useState<ObjectChecklistType | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<number[][]>([]);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleAssigneeChange = (value: string | undefined) => {
    setAssignee(value || '');
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      message.error('Название объекта обязательно для заполнения');
      return;
    }

    if (polygonCoords.length === 0) {
      message.error('Необходимо указать географическую область объекта');
      return;
    }

    if (!startDate) {
      message.error('Дата начала обязательна для заполнения');
      return;
    }

    if (!endDate) {
      message.error('Дата окончания обязательна для заполнения');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      message.error('Дата окончания должна быть позже даты начала');
      return;
    }

    setLoading(true);
    try {
      const objectData: CreateObjectData = {
        name: name.trim(),
        assignee: assignee.trim(),
        description: description.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        polygonCoords,
      };

      console.log('Создание объекта:', objectData);

      // Отправляем запрос на бэкенд
      const createdObject = await apiClient.createObject(objectData);
      console.log('Объект создан:', createdObject);

      // Создаем чеклист для нового объекта, если он есть
      if (checklist) {
        const newChecklist: ObjectChecklistType = {
          ...checklist,
          id: `checklist-${Date.now()}`,
          objectId: createdObject.id,
        };
        console.log('Создание чеклиста:', newChecklist);
        // TODO: Добавить API для создания чеклиста
      }

      message.success('Объект успешно создан');

      // Переходим к списку объектов
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при создании объекта:', error);

      if (error instanceof ApiError) {
        message.error(`Ошибка: ${error.message}`);
        if (error.details) {
          console.error('Детали ошибки:', error.details);
        }
      } else {
        message.error('Ошибка при создании объекта');
      }
    } finally {
      setLoading(false);
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
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: 'Новая задача',
      completed: false,
      createdAt: new Date(),
    };

    if (!checklist) {
      // Создаем новый чеклист
      const newChecklist: ObjectChecklistType = {
        id: `checklist-${Date.now()}`,
        objectId: '', // Будет установлен при сохранении
        title: 'Чеклист задач',
        items: [newItem],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChecklist(newChecklist);
    } else {
      setChecklist({
        ...checklist,
        items: [...checklist.items, newItem],
        updatedAt: new Date(),
      });
    }
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

  const handleCreateChecklist = () => {
    if (checklist) return;

    const newChecklist: ObjectChecklistType = {
      id: `checklist-${Date.now()}`,
      objectId: '', // Будет установлен при сохранении
      title: 'Чеклист задач',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChecklist(newChecklist);
  };

  return {
    loading,
    name,
    assignee,
    description,
    startDate,
    endDate,
    checklist,
    polygonCoords,
    handleNameChange,
    handleAssigneeChange,
    handleDescriptionChange,
    handleStartDateChange,
    handleEndDateChange,
    handleSave,
    handleBack,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
    handleCreateChecklist,
    setPolygonCoords,
  };
};
