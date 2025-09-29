import { useState, useMemo, useEffect } from 'react';
import { ViewMode } from 'gantt-task-react';
import { objectsApi, checklistsApi } from '../../../shared/api';
import type {
  ObjectApi,
  WorkApi,
  ChecklistApi,
  ChecklistItemApi,
} from '../../../shared/api/types';
import {
  CustomTaskListHeader,
  EmptyTaskListHeader,
  MinimalTaskListHeader,
} from '../ui/CustomTaskListHeader';
import {
  ExtendedTask,
  ExtendedViewMode,
  GanntTableState,
  GanntTableActions,
  GanntTableProps,
} from '../model/types';

export const useGanntTable = ({
  selectedWorks = [],
  headerType = 'custom',
}: GanntTableProps): GanntTableState &
  GanntTableActions & { tasks: ExtendedTask[] } => {
  const [viewMode, setViewMode] = useState<ExtendedViewMode>(
    ExtendedViewMode.Month
  );
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(
    new Set()
  );

  // Состояние для данных из бэкенда
  const [objects, setObjects] = useState<ObjectApi[]>([]);
  const [works, setWorks] = useState<WorkApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для загрузки данных из бэкенда
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем объекты
      const objectsResponse = await objectsApi.getAll();
      const objectsData = objectsResponse.data;
      setObjects(objectsData);

      // Загружаем чеклисты для всех объектов и используем их как задачи
      const allChecklists: ChecklistApi[] = [];
      for (const obj of objectsData) {
        try {
          const checklistsData = await checklistsApi.getByObjectId(obj.id);
          allChecklists.push(...checklistsData);
        } catch (err) {
          console.warn(
            `Не удалось загрузить чеклисты для объекта ${obj.id}:`,
            err
          );
        }
      }

      // Преобразуем чеклисты в работы для диаграммы Ганта
      const worksFromChecklists: WorkApi[] = [];
      allChecklists.forEach(checklist => {
        checklist.items.forEach((item: ChecklistItemApi) => {
          worksFromChecklists.push({
            id: item.id,
            objectId: checklist.objectId,
            name: item.text,
            startDate: new Date().toISOString(),
            endDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // +7 дней
            progress: item.completed ? 100 : 0,
            type: 'TASK',
            assignee: '',
            parent: checklist.objectId,
            dependencies: [],
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
          });
        });
      });
      setWorks(worksFromChecklists);

      // Раскрываем первый объект по умолчанию
      if (objectsData.length > 0) {
        setExpandedObjects(new Set([objectsData[0].id]));
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

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

  // Функция для преобразования кастомного режима в режим библиотеки
  const getGanttViewMode = (mode: ExtendedViewMode): ViewMode => {
    switch (mode) {
      case ExtendedViewMode.Day:
        return ViewMode.Day;
      case ExtendedViewMode.Month:
        return ViewMode.Month;
      case ExtendedViewMode.Quarter:
        return ViewMode.Month; // Используем Month как базу для кварталов
      case ExtendedViewMode.Year:
        return ViewMode.Year;
      default:
        return ViewMode.Month;
    }
  };

  // Функция для выбора компонента заголовка
  const getTaskListHeader = () => {
    switch (headerType) {
      case 'custom':
        return CustomTaskListHeader;
      case 'empty':
        return EmptyTaskListHeader;
      case 'minimal':
        return MinimalTaskListHeader;
      default:
        return undefined; // Используем дефолтный заголовок
    }
  };

  const tasks = useMemo(() => {
    const allTasks: ExtendedTask[] = [];

    // Добавляем объекты и их задачи в правильном порядке
    objects.forEach(obj => {
      // Добавляем объект
      allTasks.push({
        start: new Date(obj.startDate),
        end: new Date(obj.endDate),
        name: obj.name,
        id: obj.id,
        type: obj.type.toLowerCase() as 'project' | 'task',
        progress: obj.progress,
        isDisabled: false,
        assignee: obj.assignee,
        isExpanded: expandedObjects.has(obj.id),
        styles: {
          progressColor: '#52c41a',
          backgroundColor: '#f6ffed',
        },
      });

      // Если объект раскрыт, добавляем его задачи сразу после объекта
      if (expandedObjects.has(obj.id)) {
        // Находим все работы, которые принадлежат этому объекту
        const objectWorks = works.filter(work => work.objectId === obj.id);

        // Применяем фильтры по работам
        let filteredWorks = objectWorks;
        if (selectedWorks.length > 0) {
          filteredWorks = filteredWorks.filter(work =>
            selectedWorks.includes(work.name)
          );
        }

        // Добавляем отфильтрованные работы сразу после объекта
        filteredWorks.forEach(work => {
          allTasks.push({
            start: new Date(work.startDate),
            end: new Date(work.endDate),
            name: work.name,
            id: work.id,
            type: work.type.toLowerCase() as 'project' | 'task' | 'milestone',
            progress: work.progress,
            isDisabled: false,
            assignee: work.assignee || '',
            parent: work.parent,
            styles: {
              progressColor: '#1890ff',
              backgroundColor: '#f0f0f0',
            },
            dependencies: work.dependencies,
          });
        });
      }
    });

    return allTasks;
  }, [objects, works, selectedWorks, expandedObjects]);

  return {
    // State
    viewMode,
    expandedObjects,
    tasks,
    loading,
    error,
    // Actions
    setViewMode,
    toggleObjectExpansion,
    getGanttViewMode,
    getTaskListHeader,
    loadData,
  };
};
