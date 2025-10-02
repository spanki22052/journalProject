import React from 'react';
import { Layout, Menu, Dropdown, Space, Typography } from 'antd';
import { useNavigation } from '../hooks/useNavigation';
import styles from '../Navigation.module.css';

const { Header } = Layout;
const { Text } = Typography;

export const Navigation: React.FC = () => {
  const { handleMenuClick, getSelectedKeys, menuItems, userMenuItems, user } = useNavigation();

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
      <div className={styles.userSection}>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', color: 'white' }}>
            <Text style={{ color: 'white' }}>
              {user?.fullName || 'Пользователь'}
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              ({user?.role === 'INSPECTOR' ? 'Инспектор' : 
                user?.role === 'CONTRACTOR' ? 'Подрядчик' : 
                user?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'})
            </Text>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};
