import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  useObject,
  useUpdateObject,
  objectQueryKeys,
} from '@entities/object/api/objectApi';
import {
  useChecklistsByObject,
  useCreateChecklist,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  checklistQueryKeys,
} from '@entities/checklist/api/checklistApi';
import { useQueryClient } from '@tanstack/react-query';
import { ObjectData } from '@pages/objects/model/types';
import type { ObjectChecklistType } from '@features/object-checklist';

export const useObjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [assignee, setAssignee] = useState('');

  // Загружаем объект через API
  const { data: apiObject, isLoading: loading, error } = useObject(id || '');

  // Загружаем чеклисты объекта
  const { data: checklistsData, isLoading: checklistsLoading } =
    useChecklistsByObject(id || '');

  // Мутации для обновления объекта и работы с чеклистами
  const updateObjectMutation = useUpdateObject();
  const createChecklistMutation = useCreateChecklist();
  const createChecklistItemMutation = useCreateChecklistItem();
  const updateChecklistItemMutation = useUpdateChecklistItem();
  const deleteChecklistItemMutation = useDeleteChecklistItem();

  // Преобразуем данные API в формат компонента
  const objectData: ObjectData | null = apiObject
    ? {
        id: apiObject.id,
        name: apiObject.name,
        startDate: new Date(apiObject.startDate),
        endDate: new Date(apiObject.endDate),
        progress: apiObject.progress,
        type: apiObject.type.toLowerCase() as 'project' | 'task' | 'subtask',
        assignee: apiObject.assignee,
        isExpanded: apiObject.isExpanded,
      }
    : null;

  // Преобразуем чеклисты из API формата
  const checklistData: ObjectChecklistType | null = useMemo(() => {
    if (!checklistsData || checklistsData.length === 0) {
      // Если чеклистов нет, создаем пустой чеклист для отображения
      return {
        id: '',
        objectId: id || '',
        title: 'Чеклист задач',
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };
    }

    // Берем первый чеклист (можно расширить для поддержки нескольких)
    const firstChecklist = checklistsData[0];
    return {
      id: firstChecklist.id,
      objectId: firstChecklist.objectId,
      title: firstChecklist.title,
      createdAt: new Date(firstChecklist.createdAt),
      updatedAt: new Date(firstChecklist.updatedAt),
      items: firstChecklist.items.map((item: any) => ({
        id: item.id,
        text: item.text,
        completed: item.completed,
        createdAt: new Date(item.createdAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      })),
    };
  }, [checklistsData, id]);

  // Обновляем локальное состояние при загрузке данных
  useEffect(() => {
    if (apiObject) {
      setName(apiObject.name);
      setAssignee(apiObject.assignee);
    }
  }, [apiObject]);

  const handleNameChange = (value: string) => {
    setName(value);
  };

  const handleAssigneeChange = (value: string | undefined) => {
    setAssignee(value || '');
  };

  const handleSave = async () => {
    if (!objectData || !apiObject) return;

    try {
      // Подготавливаем данные для обновления
      const updateData = {
        id: apiObject.id,
        name: name.trim(),
        assignee: assignee.trim(),
        description: apiObject.description,
        type: apiObject.type,
        startDate: apiObject.startDate,
        endDate: apiObject.endDate,
        progress: apiObject.progress,
        isExpanded: apiObject.isExpanded,
      };

      // Обновляем объект через API
      await updateObjectMutation.mutateAsync(updateData);

      message.success('Объект успешно сохранен');
      navigate('/objects');
    } catch (error) {
      console.error('Ошибка при сохранении объекта:', error);
      message.error('Ошибка при сохранении объекта');
    }
  };

  const handleBack = () => {
    navigate('/objects');
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!checklistData || !id) return;

    const item = checklistData.items.find(i => i.id === itemId);
    if (!item) return;

    try {
      await updateChecklistItemMutation.mutateAsync({
        itemId,
        data: {
          completed: !item.completed,
          completedAt: !item.completed ? new Date().toISOString() : undefined,
        },
      });

      // Инвалидируем кэш чеклистов для объекта
      await queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.byObject(id),
      });
      // Прогресс объекта обновляется на бэкенде → обновим кэш объекта и списков
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.lists(),
      });
    } catch (error) {
      console.error('Ошибка при обновлении элемента чеклиста:', error);
      message.error('Ошибка при обновлении задачи');
    }
  };

  const handleAddChecklistItem = async (taskData: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    if (!checklistData || !id) return;

    try {
      // Если чеклист еще не создан (id пустой), создаем его сначала
      if (!checklistData.id) {
        const newChecklist = await createChecklistMutation.mutateAsync({
          objectId: id,
          title: 'Чеклист задач',
        });

        // Инвалидируем кэш чеклистов для объекта
        await queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.byObject(id),
        });

        // Теперь добавляем элемент в созданный чеклист
        await createChecklistItemMutation.mutateAsync({
          checklistId: newChecklist.id,
          text: taskData.title,
          completed: false,
        });
      } else {
        // Если чеклист уже существует, просто добавляем элемент
        await createChecklistItemMutation.mutateAsync({
          checklistId: checklistData.id,
          text: taskData.title,
          completed: false,
        });
      }

      // Инвалидируем кэш чеклистов для объекта после добавления элемента
      await queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.byObject(id),
      });
      // Прогресс объекта обновляется на бэкенде → обновим кэш объекта и списков
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.lists(),
      });

      // Показываем информацию о созданной задаче
      const priorityText = {
        low: 'низкий',
        medium: 'средний',
        high: 'высокий',
      }[taskData.priority];

      let taskInfo = `Задача "${taskData.title}" создана с приоритетом ${priorityText}`;
      if (taskData.startDate && taskData.endDate) {
        taskInfo += ` (${taskData.startDate} - ${taskData.endDate})`;
      } else if (taskData.startDate) {
        taskInfo += ` (с ${taskData.startDate})`;
      } else if (taskData.endDate) {
        taskInfo += ` (до ${taskData.endDate})`;
      }

      message.success(taskInfo);
    } catch (error) {
      console.error('Ошибка при добавлении элемента чеклиста:', error);
      message.error('Ошибка при добавлении задачи');
    }
  };

  const handleEditChecklistItem = async (
    itemId: string,
    taskData: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      priority: 'low' | 'medium' | 'high';
    }
  ) => {
    if (!checklistData || !id) return;

    try {
      await updateChecklistItemMutation.mutateAsync({
        itemId,
        data: {
          text: taskData.title,
        },
      });

      // Инвалидируем кэш чеклистов для объекта
      await queryClient.invalidateQueries({
        queryKey: checklistQueryKeys.byObject(id),
      });
      // Прогресс объекта обновляется на бэкенде → обновим кэш объекта и списков
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: objectQueryKeys.lists(),
      });

      // Показываем уведомление об обновлении задачи
      const priorityText = {
        low: 'низкий',
        medium: 'средний',
        high: 'высокий',
      }[taskData.priority];

      let taskInfo = `Задача "${taskData.title}" обновлена с приоритетом ${priorityText}`;
      if (taskData.startDate && taskData.endDate) {
        taskInfo += ` (${taskData.startDate} - ${taskData.endDate})`;
      } else if (taskData.startDate) {
        taskInfo += ` (с ${taskData.startDate})`;
      } else if (taskData.endDate) {
        taskInfo += ` (до ${taskData.endDate})`;
      }

      message.success(taskInfo);
    } catch (error) {
      console.error('Ошибка при редактировании элемента чеклиста:', error);
      message.error('Ошибка при редактировании задачи');
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!checklistData || !id) return;

    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        await deleteChecklistItemMutation.mutateAsync(itemId);

        // Инвалидируем кэш чеклистов для объекта
        await queryClient.invalidateQueries({
          queryKey: checklistQueryKeys.byObject(id),
        });
      } catch (error) {
        console.error('Ошибка при удалении элемента чеклиста:', error);
        message.error('Ошибка при удалении задачи');
      }
    }
  };

  return {
    objectData,
    loading:
      loading ||
      checklistsLoading ||
      updateObjectMutation.isPending ||
      createChecklistMutation.isPending ||
      createChecklistItemMutation.isPending ||
      updateChecklistItemMutation.isPending ||
      deleteChecklistItemMutation.isPending,
    name,
    assignee,
    checklist: checklistData,
    error,
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
