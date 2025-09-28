import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import type {
  ObjectChecklistType,
  ChecklistItem,
} from '@features/object-checklist';
import { CreateObjectData } from '../model/types';

export const useObjectCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ObjectChecklistType | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleAssigneeChange = (value: string | undefined) => {
    setAssignee(value || '');
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      message.error('Название объекта обязательно для заполнения');
      return;
    }

    setLoading(true);
    try {
      // В реальном приложении здесь был бы API запрос для создания объекта
      const newObjectId = `obj-${Date.now()}`;

      const objectData: CreateObjectData = {
        name: name.trim(),
        assignee: assignee.trim(),
        description: description.trim(),
      };

      console.log('Создание объекта:', objectData);

      // Имитация задержки API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Создаем чеклист для нового объекта, если он есть
      if (checklist) {
        const newChecklist: ObjectChecklistType = {
          ...checklist,
          id: `checklist-${Date.now()}`,
          objectId: newObjectId,
        };
        console.log('Создание чеклиста:', newChecklist);
      }

      message.success('Объект успешно создан');

      // Переходим к списку объектов
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при создании объекта:', error);
      message.error('Ошибка при создании объекта');
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
    checklist,
    handleNameChange,
    handleAssigneeChange,
    handleDescriptionChange,
    handleSave,
    handleBack,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
    handleCreateChecklist,
  };
};
