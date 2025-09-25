import React from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Card, Typography, Button, Space, Tag } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  FilterOutlined,
  DownOutlined,
  RightOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useGanntTable } from '../hooks/useGanntTable';
import {
  ExtendedTask,
  ExtendedViewMode,
  GanntTableProps,
} from '../model/types';
import styles from './GanntTable.module.css';

const { Title } = Typography;

export const GanntTable: React.FC<GanntTableProps> = ({
  selectedOrganization,
  selectedWorks = [],
  headerType = 'custom',
  onOpenFilters,
}) => {
  const {
    viewMode,
    expandedObjects,
    tasks,
    setViewMode,
    toggleObjectExpansion,
    getGanttViewMode,
    getTaskListHeader,
  } = useGanntTable({
    selectedOrganization,
    selectedWorks,
    headerType,
    onOpenFilters,
  });

  return (
    <Card
      className={`${styles.card} ${
        viewMode === ExtendedViewMode.Quarter ? styles.quarterView : ''
      }`}
    >
      <div className={styles.header}>
        <Title level={3} className={styles.title}>
          Диаграмма Ганта
        </Title>
        <Space className={styles.viewControls}>
          <Button
            type='default'
            icon={<FilterOutlined />}
            onClick={onOpenFilters}
            size='small'
          >
            Фильтры
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Day ? 'primary' : 'default'}
            icon={<ClockCircleOutlined />}
            onClick={() => setViewMode(ExtendedViewMode.Day)}
            size='small'
          >
            День
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Month ? 'primary' : 'default'}
            icon={<CalendarOutlined />}
            onClick={() => setViewMode(ExtendedViewMode.Month)}
            size='small'
          >
            Месяц
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Quarter ? 'primary' : 'default'}
            icon={<BarChartOutlined />}
            onClick={() => setViewMode(ExtendedViewMode.Quarter)}
            size='small'
            className={
              viewMode === ExtendedViewMode.Quarter ? styles.quarterButton : ''
            }
          >
            Квартал
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Year ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode(ExtendedViewMode.Year)}
            size='small'
          >
            Год
          </Button>
        </Space>
      </div>

      {tasks.length > 0 ? (
        <div className={styles.ganttContainer}>
          <Gantt
            tasks={tasks}
            viewMode={getGanttViewMode(viewMode)}
            columnWidth={viewMode === ExtendedViewMode.Quarter ? 200 : 65}
            listCellWidth='400px'
            fontSize='12'
            locale='ru'
            headerHeight={50}
            barBackgroundColor='#1890ff'
            barProgressColor='#40a9ff'
            barProgressSelectedColor='#096dd9'
            TaskListHeader={getTaskListHeader()}
            TaskListTable={({ rowHeight, tasks }) => (
              <div className={styles.taskList}>
                {tasks.map(task => {
                  const extendedTask = task as ExtendedTask;
                  const isObject = extendedTask.type === 'project';
                  const isExpanded = expandedObjects.has(task.id);

                  return (
                    <div
                      key={task.id}
                      className={`${styles.taskRow} ${
                        isObject ? styles.objectRow : styles.taskRowChild
                      }`}
                      style={{ height: rowHeight }}
                    >
                      {/* Колонка объектов/задач */}
                      <div
                        className={`${styles.taskCell} ${
                          isObject ? styles.objectCell : ''
                        }`}
                        style={{ width: 250 }}
                      >
                        <div className={styles.taskNameContainer}>
                          {isObject && (
                            <button
                              className={styles.expandButton}
                              onClick={() => toggleObjectExpansion(task.id)}
                            >
                              {isExpanded ? (
                                <DownOutlined />
                              ) : (
                                <RightOutlined />
                              )}
                            </button>
                          )}
                          <div
                            className={`${styles.taskName} ${
                              isObject ? styles.objectName : ''
                            }`}
                          >
                            {task.name}
                          </div>
                        </div>
                      </div>

                      {/* Колонка исполнителей */}
                      <div className={styles.taskCell} style={{ width: 150 }}>
                        {!isObject && extendedTask.assignee && (
                          <Tag color='blue' className={styles.assigneeTag}>
                            {extendedTask.assignee}
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            TooltipContent={({ task }) => (
              <div className={styles.tooltip}>
                <h4>{task.name}</h4>
                <p>Исполнитель: {(task as ExtendedTask).assignee}</p>
                <p>Прогресс: {task.progress}%</p>
                <p>Начало: {task.start.toLocaleDateString('ru-RU')}</p>
                <p>Окончание: {task.end.toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Нет данных для отображения</p>
        </div>
      )}
    </Card>
  );
};
