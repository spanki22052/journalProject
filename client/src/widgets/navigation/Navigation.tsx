import React from 'react';
import { Layout, Menu } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from './Navigation.module.css';

const { Header } = Layout;

export const Navigation: React.FC = () => {
  const menuItems = [
    {
      key: 'gantt',
      icon: <CalendarOutlined />,
      label: 'Диаграмма Ганта',
    },
  ];

  return (
    <Header className={styles.header}>
      <div className={styles.logo}>Журнал</div>
      <Menu
        theme='dark'
        mode='horizontal'
        defaultSelectedKeys={['gantt']}
        items={menuItems}
        className={styles.menu}
      />
    </Header>
  );
};
