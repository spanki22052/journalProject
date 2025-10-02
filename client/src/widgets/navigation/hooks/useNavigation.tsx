import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  CalendarOutlined,
  MessageOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '@shared/lib/auth-context';
import { Button, Dropdown, Space } from 'antd';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu clicked:', key);
    switch (key) {
      case 'gantt':
        navigate('/');
        break;
      case 'objects':
        navigate('/objects');
        break;
      case 'chats':
        navigate('/chats');
        break;
      default:
        break;
    }
  };

  const getSelectedKeys = () => {
    // Подсветка для списка и детальных страниц чатов
    if (location.pathname.startsWith('/chats')) {
      return ['chats'];
    }
    switch (location.pathname) {
      case '/':
      case '/main':
        return ['gantt'];
      case '/objects':
        return ['objects'];
      default:
        return ['gantt'];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.fullName || 'Пользователь',
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    ...(hasPermission('view-gantt') ? [{
      key: 'gantt',
      icon: <CalendarOutlined />,
      label: 'Диаграмма',
    }] : []),
    ...(hasPermission('view-objects') ? [{
      key: 'objects',
      icon: <AppstoreOutlined />,
      label: 'Объекты',
    }] : []),
    ...(hasPermission('view-chats') ? [{
      key: 'chats',
      icon: <MessageOutlined />,
      label: 'Чаты',
    }] : []),
  ];

  return {
    handleMenuClick,
    getSelectedKeys,
    menuItems,
    userMenuItems,
    user,
  };
};
