import React, { useState, useEffect } from 'react';
import styles from './GanntTable.module.css';

interface CustomTaskListHeaderProps {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}

// Кастомный компонент заголовка с русскими названиями колонок
export const CustomTaskListHeader: React.FC<CustomTaskListHeaderProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div
      className={styles.customTaskListHeader}
      style={{
        height: headerHeight,
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.customHeaderCell}
        style={{ width: isMobile ? 100 : 275 }}
      >
        Объект
      </div>
      <div
        className={styles.customHeaderCell}
        style={{ width: isMobile ? 100 : 200 }}
      >
        Исполнитель
      </div>
    </div>
  );
};

// Компонент для полного скрытия заголовка
export const EmptyTaskListHeader: React.FC = () => {
  return null;
};

// Альтернативный компонент с минимальным заголовком
export const MinimalTaskListHeader: React.FC<CustomTaskListHeaderProps> = ({
  headerHeight,
  rowWidth,
  fontFamily,
  fontSize,
}) => {
  return (
    <div
      className={styles.minimalTaskListHeader}
      style={{
        height: headerHeight,
        width: rowWidth,
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      Задачи
    </div>
  );
};
