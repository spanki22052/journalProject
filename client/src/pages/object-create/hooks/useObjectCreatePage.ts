import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useCreateObject } from '@entities/object/api/objectApi';
import {
  useCreateChecklist,
  useCreateChecklistItem,
} from '@entities/checklist/api/checklistApi';
import type {
  ObjectChecklistType,
  ChecklistItem,
} from '@features/object-checklist';

export const useObjectCreatePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ObjectChecklistType | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<number[][]>([]);

  // Мутации для создания объекта и чеклиста
  const createObjectMutation = useCreateObject();
  const createChecklistMutation = useCreateChecklist();
  const createChecklistItemMutation = useCreateChecklistItem();

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

    if (polygonCoords.length === 0) {
      message.error('Необходимо указать географическую область объекта');
      return;
    }

    try {
      // Подготавливаем данные для API
      const objectData = {
        name: name.trim(),
        description: description.trim() || undefined,
        type: 'PROJECT' as const,
        assignee: assignee.trim(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней
        progress: 0,
        isExpanded: true,
      };

      // Создаем объект через API
      const createdObject = await createObjectMutation.mutateAsync(objectData);

      // Создаем чеклист для нового объекта, если он есть
      if (checklist && checklist.items.length > 0) {
        try {
          // Создаем чеклист через API
          const createdChecklist = await createChecklistMutation.mutateAsync({
            objectId: createdObject.id,
            title: checklist.title,
          });

          // Создаем элементы чеклиста через API
          for (const item of checklist.items) {
            await createChecklistItemMutation.mutateAsync({
              checklistId: createdChecklist.id,
              text: item.text,
              completed: item.completed,
            });
          }

          console.log('Чеклист успешно создан:', createdChecklist);
        } catch (checklistError) {
          console.error('Ошибка при создании чеклиста:', checklistError);
          message.warning(
            'Объект создан, но произошла ошибка при создании чеклиста'
          );
        }
      }

      message.success('Объект успешно создан');
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при создании объекта:', error);
      message.error('Ошибка при создании объекта');
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
    loading:
      createObjectMutation.isPending ||
      createChecklistMutation.isPending ||
      createChecklistItemMutation.isPending,
    name,
    assignee,
    description,
    checklist,
    polygonCoords,
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
    setPolygonCoords,
  };
};
