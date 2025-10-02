import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Space,
  Typography,
  Button,
  Drawer,
} from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useNavigation } from '../hooks/useNavigation';
import styles from '../Navigation.module.css';

const { Header } = Layout;
const { Text } = Typography;

export const Navigation: React.FC = () => {
  const { handleMenuClick, getSelectedKeys, menuItems, userMenuItems, user } =
    useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuClick = ({ key }: { key: string }) => {
    handleMenuClick({ key });
    setMobileMenuOpen(false);
  };

  return (
    <Header className={styles.header}>
      <div className={styles.logo}>Журнал</div>

      {/* Desktop Menu */}
      <Menu
        theme='dark'
        mode='horizontal'
        selectedKeys={getSelectedKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.desktopMenu}
      />

      {/* Mobile Menu Button */}
      <Button
        type='text'
        icon={<MenuOutlined />}
        className={styles.mobileMenuButton}
        onClick={() => setMobileMenuOpen(true)}
      />

      {/* Desktop User Section */}
      <div className={styles.userSection}>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement='bottomRight'
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', color: 'white' }}>
            <Text style={{ color: 'white' }}>
              {user?.fullName || 'Пользователь'}
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              (
              {user?.role === 'INSPECTOR'
                ? 'Инспектор'
                : user?.role === 'CONTRACTOR'
                  ? 'Подрядчик'
                  : user?.role === 'ADMIN'
                    ? 'Администратор'
                    : 'Пользователь'}
              )
            </Text>
          </Space>
        </Dropdown>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title='Меню'
        placement='right'
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className={styles.mobileDrawer}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode='vertical'
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMobileMenuClick}
          className={styles.mobileMenu}
        />
        <div className={styles.mobileUserSection}>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement='topRight'
            trigger={['click']}
          >
            <Space
              style={{ cursor: 'pointer', color: '#001529', padding: '16px' }}
            >
              <Text>{user?.fullName || 'Пользователь'}</Text>
              <Text style={{ color: 'rgba(0, 21, 41, 0.65)' }}>
                (
                {user?.role === 'INSPECTOR'
                  ? 'Инспектор'
                  : user?.role === 'CONTRACTOR'
                    ? 'Подрядчик'
                    : user?.role === 'ADMIN'
                      ? 'Администратор'
                      : 'Пользователь'}
                )
              </Text>
            </Space>
          </Dropdown>
        </div>
      </Drawer>
    </Header>
  );
};
