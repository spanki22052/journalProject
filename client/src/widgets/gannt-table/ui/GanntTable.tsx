import React from 'react';
import { Card, Button, Spin, Alert } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Willow, Gantt } from 'wx-react-gantt';
import { Locale } from 'wx-react-core';
import { useGanntTable } from '../hooks/useGanntTable';
import { ExtendedViewMode } from '../model/types';
import styles from './GanntTable.module.css';
import 'wx-react-gantt/dist/gantt.css';

interface GanntTableProps {
  selectedOrganization?: string;
  selectedWorks?: string[];
  headerType?: 'custom' | 'empty' | 'minimal' | 'default';
  onOpenFilters?: () => void;
}

export const GanntTable: React.FC<GanntTableProps> = ({ onOpenFilters }) => {
  const { viewMode, tasks, loading, error, setViewMode, scales, columns } =
    useGanntTable();

  // Обработчики для переключения режимов просмотра
  const handleViewModeChange = (mode: ExtendedViewMode) => {
    setViewMode(mode);
  };

  // Если загружается, показываем спиннер
  if (loading) {
    return (
      <Card className={styles.card}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <Spin size='large' />
          <p style={{ marginTop: '16px', color: '#8c8c8c' }}>
            Загрузка данных...
          </p>
        </div>
      </Card>
    );
  }

  // Если есть ошибка, показываем её
  if (error) {
    return (
      <Card className={styles.card}>
        <Alert
          message='Ошибка загрузки данных'
          description={error}
          type='error'
          showIcon
          action={
            <Button size='small' onClick={() => window.location.reload()}>
              Обновить
            </Button>
          }
        />
      </Card>
    );
  }

  // Если нет задач, показываем пустое состояние
  if (tasks.length === 0) {
    return (
      <Card className={styles.card}>
        <div className={styles.emptyState}>
          <CalendarOutlined
            style={{
              fontSize: '48px',
              color: '#d9d9d9',
              marginBottom: '16px',
            }}
          />
          <p>Нет данных для отображения</p>
          {onOpenFilters && (
            <Button type='primary' onClick={onOpenFilters}>
              Настроить фильтры
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      {/* Заголовок с элементами управления */}
      <div className={styles.header}>
        <h2 className={styles.title}>Диаграмма Ганта</h2>

        <div className={styles.viewControls}>
          <Button
            type={viewMode === ExtendedViewMode.Day ? 'primary' : 'default'}
            size='small'
            icon={<ClockCircleOutlined />}
            onClick={() => handleViewModeChange(ExtendedViewMode.Day)}
          >
            День
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Month ? 'primary' : 'default'}
            size='small'
            icon={<CalendarOutlined />}
            onClick={() => handleViewModeChange(ExtendedViewMode.Month)}
          >
            Месяц
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Quarter ? 'primary' : 'default'}
            size='small'
            icon={<BarChartOutlined />}
            onClick={() => handleViewModeChange(ExtendedViewMode.Quarter)}
            className={styles.quarterButton}
          >
            Квартал
          </Button>
          <Button
            type={viewMode === ExtendedViewMode.Year ? 'primary' : 'default'}
            size='small'
            icon={<AppstoreOutlined />}
            onClick={() => handleViewModeChange(ExtendedViewMode.Year)}
          >
            Год
          </Button>
        </div>
      </div>

      {/* Контейнер с диаграммой Ганта */}
      <div className={styles.ganttWrapper}>
        <Willow>
          <Gantt
            tasks={tasks}
            scales={scales}
            links={[{ id: 1, source: 20, target: 21, type: 'e2e' }]}
            columns={columns}
            cellHeight={40}
            scaleHeight={50}
            editorShape={[]}
          />
        </Willow>
      </div>
    </Card>
  );
};
