import { useState, useMemo } from 'react';
import { ViewMode } from 'gantt-task-react';
import { mockOrganizations, mockObjects } from '../../../shared/api/mockData';
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
  selectedOrganization,
  selectedWorks = [],
  headerType = 'custom',
}: GanntTableProps): GanntTableState &
  GanntTableActions & { tasks: ExtendedTask[] } => {
  const [viewMode, setViewMode] = useState<ExtendedViewMode>(
    ExtendedViewMode.Month
  );
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(
    new Set(['1'])
  );

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
    mockObjects.forEach(obj => {
      // Добавляем объект
      allTasks.push({
        start: obj.startDate,
        end: obj.endDate,
        name: obj.name,
        id: obj.id,
        type: obj.type,
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
        const objectWorks = mockOrganizations.flatMap(org =>
          org.works.filter(work => work.parent === obj.id)
        );

        // Применяем фильтры, если выбрана организация
        let filteredWorks = objectWorks;
        if (selectedOrganization) {
          const org = mockOrganizations.find(
            o => o.id === selectedOrganization
          );
          if (org) {
            filteredWorks = org.works.filter(work => work.parent === obj.id);
          }
        }

        // Применяем фильтры по работам
        if (selectedWorks.length > 0) {
          filteredWorks = filteredWorks.filter(work =>
            selectedWorks.includes(work.name)
          );
        }

        // Добавляем отфильтрованные работы сразу после объекта
        filteredWorks.forEach(work => {
          allTasks.push({
            start: work.startDate,
            end: work.endDate,
            name: work.name,
            id: work.id,
            type: work.type,
            progress: work.progress,
            isDisabled: false,
            assignee: work.assignee,
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
  }, [selectedOrganization, selectedWorks, expandedObjects]);

  return {
    // State
    viewMode,
    expandedObjects,
    tasks,
    // Actions
    setViewMode,
    toggleObjectExpansion,
    getGanttViewMode,
    getTaskListHeader,
  };
};
