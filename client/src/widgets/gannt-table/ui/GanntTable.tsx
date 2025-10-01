import React, { useState, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Card, Typography, Button, Space, Tag, Modal, Tooltip } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  FilterOutlined,
  DownOutlined,
  RightOutlined,
  BarChartOutlined,
  EyeOutlined,
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
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 750);
      setIsVerySmall(width < 500);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.innerWidth]);

  const {
    viewMode,
    expandedObjects,
    tasks,
    loading,
    error,
    setViewMode,
    toggleObjectExpansion,
    getGanttViewMode,
    getTaskListHeader,
    loadData,
  } = useGanntTable({
    selectedOrganization,
    selectedWorks,
    headerType,
    onOpenFilters,
  });

  // Компонент кнопок видов
  const ViewButtons = ({ onViewSelect }: { onViewSelect?: () => void }) => (
    <Space
      direction={isMobile ? 'vertical' : 'horizontal'}
      size='small'
      style={{ width: isMobile ? '100%' : 'auto' }}
    >
      <Button
        type={viewMode === ExtendedViewMode.Day ? 'primary' : 'default'}
        icon={<ClockCircleOutlined />}
        onClick={() => {
          setViewMode(ExtendedViewMode.Day);
          onViewSelect?.();
        }}
        size='small'
        block={isMobile}
      >
        День
      </Button>
      <Button
        type={viewMode === ExtendedViewMode.Month ? 'primary' : 'default'}
        icon={<CalendarOutlined />}
        onClick={() => {
          setViewMode(ExtendedViewMode.Month);
          onViewSelect?.();
        }}
        size='small'
        block={isMobile}
      >
        Месяц
      </Button>
      <Button
        type={viewMode === ExtendedViewMode.Quarter ? 'primary' : 'default'}
        icon={<BarChartOutlined />}
        onClick={() => {
          setViewMode(ExtendedViewMode.Quarter);
          onViewSelect?.();
        }}
        size='small'
        className={
          viewMode === ExtendedViewMode.Quarter ? styles.quarterButton : ''
        }
        block={isMobile}
      >
        Квартал
      </Button>
      <Button
        type={viewMode === ExtendedViewMode.Year ? 'primary' : 'default'}
        icon={<AppstoreOutlined />}
        onClick={() => {
          setViewMode(ExtendedViewMode.Year);
          onViewSelect?.();
        }}
        size='small'
        block={isMobile}
      >
        Год
      </Button>
    </Space>
  );

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
          <Tooltip title='Фильтры' placement='bottom'>
            <Button
              type='default'
              icon={<FilterOutlined />}
              onClick={onOpenFilters}
              size='small'
            >
              {!isVerySmall && 'Фильтры'}
            </Button>
          </Tooltip>
          {isMobile ? (
            <Tooltip title='Вид отображения' placement='bottom'>
              <Button
                type='default'
                icon={<EyeOutlined />}
                onClick={() => setIsViewModalOpen(true)}
                size='small'
              >
                {!isVerySmall && 'Вид'}
              </Button>
            </Tooltip>
          ) : (
            <ViewButtons />
          )}
        </Space>
      </div>

      {loading ? (
        <div className={styles.ganttContainer}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text>Загрузка данных...</Typography.Text>
          </div>
        </div>
      ) : error ? (
        <div className={styles.ganttContainer}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Typography.Text type='danger'>
              Ошибка загрузки: {error}
            </Typography.Text>
            <br />
            <Button onClick={loadData} style={{ marginTop: '16px' }}>
              Попробовать снова
            </Button>
          </div>
        </div>
      ) : tasks.length > 0 ? (
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
            TaskListHeader={getTaskListHeader() as any}
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
                        style={{ width: isMobile ? 100 : 250 }}
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
                      <div
                        className={styles.taskCell}
                        style={{ width: isMobile ? 100 : 150 }}
                      >
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

      {/* Модальное окно для выбора вида на мобильных устройствах */}
      <Modal
        title='Выберите вид отображения'
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={300}
        centered
      >
        <ViewButtons onViewSelect={() => setIsViewModalOpen(false)} />
      </Modal>
    </Card>
  );
};
