import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigation } from '../hooks/useNavigation';
import styles from '../Navigation.module.css';

const { Header } = Layout;

export const Navigation: React.FC = () => {
  const { handleMenuClick, getSelectedKeys, menuItems } = useNavigation();

  return (
    <Header className={styles.header}>
      <div className={styles.logo}>Журнал</div>
      <Menu
        theme='dark'
        mode='horizontal'
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </Header>
  );
};
