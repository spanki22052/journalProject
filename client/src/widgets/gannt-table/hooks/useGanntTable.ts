import { useState, useMemo, useEffect, useCallback } from 'react';
import { useObjects } from '../../../entities/object';
import { checklistsApi } from '../../../shared/api';
import type { ChecklistItemApi } from '../../../shared/api/types';
import {
  ExtendedTask,
  ExtendedViewMode,
  GanntTableState,
  GanntTableActions,
} from '../model/types';

// Утилиты для работы с датами
const createValidDate = (
  dateInput: string | Date | undefined,
  fallbackDays = 0
): Date => {
  if (!dateInput) {
    return new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000);
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return new Date(Date.now() + fallbackDays * 24 * 60 * 60 * 1000);
  }

  return date;
};

const calculateDuration = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const useGanntTable = (): GanntTableState &
  GanntTableActions & {
    tasks: ExtendedTask[];
  } => {
  const [viewMode, setViewMode] = useState<ExtendedViewMode>(
    ExtendedViewMode.Month
  );
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(
    new Set()
  );

  // Используем хуки из entities для получения данных
  const {
    data: objectsData,
    isLoading: objectsLoading,
    error: objectsError,
  } = useObjects();
  const objects = useMemo(() => objectsData?.data || [], [objectsData?.data]);

  // Состояние для всех чеклистов
  const [allChecklists, setAllChecklists] = useState<ChecklistItemApi[]>([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [checklistsError, setChecklistsError] = useState<string | null>(null);

  // Функция для загрузки чеклистов для всех объектов
  const loadChecklists = useCallback(async () => {
    if (objects.length === 0) return;

    try {
      setChecklistsLoading(true);
      setChecklistsError(null);

      const allChecklists: ChecklistItemApi[] = [];
      for (const obj of objects) {
        try {
          const checklistsData = await checklistsApi.getByObjectId(obj.id);
          console.log(checklistsData);
          checklistsData[0].items.forEach(el =>
            allChecklists.push({ ...el, objId: checklistsData[0].objectId })
          );
        } catch (err) {
          console.warn(
            `Не удалось загрузить чеклисты для объекта ${obj.id}:`,
            err
          );
        }
      }
      setAllChecklists(prev => [...prev, ...allChecklists]);
    } catch (err) {
      console.error('Ошибка загрузки чеклистов:', err);
      setChecklistsError(
        err instanceof Error ? err.message : 'Неизвестная ошибка'
      );
    } finally {
      setChecklistsLoading(false);
    }
  }, [objects]);

  // Состояние для dropdown опций
  const [dropdownOptions, setDropdownOptions] = useState({
    priorities: [] as string[],
    workstreams: [] as string[],
    assignees: [] as string[],
  });

  // Загружаем чеклисты когда объекты загружены
  useEffect(() => {
    if (objects.length > 0) {
      loadChecklists();
      // Раскрываем первый объект по умолчанию
      setExpandedObjects(new Set([String(objects[0].id)]));
    }
  }, [objects, loadChecklists]);

  // Строим dropdown опции когда данные загружены
  useEffect(() => {
    if (objects.length > 0) {
      const priorities = new Set<string>();
      const workstreams = new Set<string>();
      const assignees = new Set<string>();

      // Добавляем опции из объектов
      objects.forEach(obj => {
        if (obj.assignee) assignees.add(obj.assignee);
        priorities.add('medium'); // По умолчанию для объектов
        workstreams.add('Основной'); // По умолчанию для объектов
      });

      // Добавляем стандартные приоритеты
      priorities.add('low');
      priorities.add('medium');
      priorities.add('high');

      // Добавляем "unassigned" опции для других полей
      workstreams.add('unassigned');
      assignees.add('unassigned');

      setDropdownOptions({
        priorities: Array.from(priorities).filter(Boolean).sort(),
        workstreams: Array.from(workstreams).sort(),
        assignees: Array.from(assignees).sort(),
      });
    }
  }, [objects, allChecklists]);

  // Функция для переключения состояния раскрытия объекта
  const toggleObjectExpansion = (objectId: string) => {
    setExpandedObjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectId)) {
        newSet.delete(objectId);
      } else {
        newSet.add(objectId);
      }
      return newSet;
    });
  };

  // Функция для получения шкал времени в зависимости от режима
  const getGanttScales = (mode: ExtendedViewMode) => {
    switch (mode) {
      case ExtendedViewMode.Day:
        return [
          { unit: 'day' as const, step: 1, format: 'd MMM' },
          { unit: 'hour' as const, step: 2, format: 'HH:mm' },
        ];
      case ExtendedViewMode.Month:
        return [
          { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
          { unit: 'day' as const, step: 1, format: 'd' },
        ];
      case ExtendedViewMode.Quarter:
        return [
          { unit: 'month' as const, step: 3, format: 'QQQ yyyy' },
          { unit: 'month' as const, step: 1, format: 'MMM' },
        ];
      case ExtendedViewMode.Year:
        return [
          { unit: 'year' as const, step: 1, format: 'yyyy' },
          { unit: 'month' as const, step: 1, format: 'MMM' },
        ];
      default:
        return [
          { unit: 'month' as const, step: 1, format: 'MMMM yyyy' },
          { unit: 'day' as const, step: 1, format: 'd' },
        ];
    }
  };

  const tasks = useMemo(() => {
    const allTasks: ExtendedTask[] = [];

    // Сортируем объекты по дате начала для правильного отображения
    const sortedObjects = [...objects].sort((a, b) => {
      const dateA = createValidDate(a.startDate, 0);
      const dateB = createValidDate(b.startDate, 0);
      return dateA.getTime() - dateB.getTime();
    });

    // Создаем маппинг ID объектов на числовые ID для Gantt
    const objectIdMapping = new Map<string, number>();
    let currentId = 0;

    // Сначала добавляем все объекты как summary задачи
    sortedObjects.forEach(obj => {
      // Валидация объекта
      if (!obj?.id || !obj?.name) {
        console.warn('Пропущен невалидный объект:', obj);
        return;
      }

      // Создаем числовой ID для объекта
      const objectGanttId = currentId++;
      objectIdMapping.set(String(obj.id), objectGanttId);

      // Создаем даты для объекта
      const startDate = createValidDate(obj.startDate, objectGanttId * 30);
      const endDate = createValidDate(
        obj.endDate,
        startDate.getTime() + 90 * 24 * 60 * 60 * 1000
      );

      // Убеждаемся, что дата окончания больше даты начала
      const finalEndDate =
        endDate > startDate
          ? endDate
          : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Добавляем объект как summary задачу в формате wx-react-gantt
      const objectTask: ExtendedTask = {
        id: objectGanttId,
        text: obj.name,
        start: startDate,
        end: finalEndDate,
        duration: calculateDuration(startDate, finalEndDate),
        progress: Math.max(0, Math.min(1, (obj.progress || 0) / 100)),
        type: 'summary',
        lazy: false,
      };

      allTasks.push(objectTask);
    });

    // Затем добавляем чеклисты для каждого объекта
    sortedObjects.forEach(obj => {
      // Получаем числовой ID объекта
      const objectGanttId = objectIdMapping.get(String(obj.id));
      if (objectGanttId === undefined) return;

      // Находим чеклисты для этого объекта
      const objectChecklists = allChecklists.filter(
        checklist => checklist?.objId === String(obj.id)
      );

      // Добавляем чеклисты как подзадачи
      objectChecklists.forEach((checklist, checklistIndex) => {
        if (!checklist?.id || !checklist?.text) {
          console.warn('Пропущен невалидный чеклист:', checklist);
          return;
        }

        // Создаем даты для чеклиста
        const objStartDate = createValidDate(obj.startDate, objectGanttId * 30);
        const objEndDate = createValidDate(
          obj.endDate,
          objStartDate.getTime() + 90 * 24 * 60 * 60 * 1000
        );
        const finalObjEndDate =
          objEndDate > objStartDate
            ? objEndDate
            : new Date(objStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const checklistStartDate = new Date(
          objStartDate.getTime() + checklistIndex * 7 * 24 * 60 * 60 * 1000
        );
        const checklistEndDate = new Date(
          checklistStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
        );

        // Убеждаемся, что чеклист не выходит за границы объекта
        const constrainedStartDate =
          checklistStartDate < objStartDate ? objStartDate : checklistStartDate;
        const constrainedEndDate =
          checklistEndDate > finalObjEndDate
            ? finalObjEndDate
            : checklistEndDate;

        // Вычисляем прогресс чеклиста на основе завершенных элементов
        const completedItems = checklist.completed ? 1 : 0;
        const totalItems = 1;
        const checklistProgress = completedItems / totalItems;

        // Создаем задачу чеклиста в формате wx-react-gantt
        const checklistTask: ExtendedTask = {
          id: currentId++,
          text: checklist.text,
          start: constrainedStartDate,
          end: constrainedEndDate,
          duration: calculateDuration(constrainedStartDate, constrainedEndDate),
          progress: checklistProgress,
          type: 'task',
          lazy: false,
          parent: objectGanttId, // Ссылка на числовой ID объекта-родителя
        };

        allTasks.push(checklistTask);
      });
    });

    // Фильтруем и валидируем финальные задачи
    const validTasks = allTasks.filter(task => {
      // Проверяем, что все обязательные поля присутствуют и корректны
      return (
        task &&
        typeof task.id === 'number' &&
        task.text &&
        task.start instanceof Date &&
        task.end instanceof Date &&
        !isNaN(task.start.getTime()) &&
        !isNaN(task.end.getTime()) &&
        task.start <= task.end &&
        typeof task.progress === 'number' &&
        task.progress >= 0 &&
        task.progress <= 1
      );
    });

    return validTasks;
  }, [objects, allChecklists]);

  // Функция для получения режима просмотра Gantt
  const getGanttViewMode = () => {
    switch (viewMode) {
      case ExtendedViewMode.Day:
        return 'day';
      case ExtendedViewMode.Month:
        return 'month';
      case ExtendedViewMode.Quarter:
        return 'quarter';
      case ExtendedViewMode.Year:
        return 'year';
      default:
        return 'month';
    }
  };

  // Создание editorShape для редактирования задач
  const editorShape = useMemo(() => {
    // Возвращаем простую строку для editorShape
    return 'default';
  }, []);

  // Создание шкал времени
  const scales = useMemo(() => {
    return getGanttScales(viewMode);
  }, [viewMode]);

  // Создание колонок таблицы
  const columns = useMemo(() => {
    return [
      { id: 'text', header: 'Объекты', width: 200 },
      { id: 'action', header: '', width: 0.1, align: 'center' as const },
    ];
  }, []);

  // Объединяем состояния загрузки и ошибок
  const loading = objectsLoading || checklistsLoading;
  const error = objectsError?.message || checklistsError || null;

  return {
    // State
    viewMode,
    expandedObjects,
    tasks,
    loading,
    error,
    dropdownOptions,
    editorShape,
    scales,
    columns,
    // Actions
    setViewMode,
    toggleObjectExpansion,
    getGanttScales,
    getGanttViewMode,
    loadData: loadChecklists,
  };
};
