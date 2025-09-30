import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  CalendarOutlined,
  MessageOutlined,
} from '@ant-design/icons';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const menuItems = [
    {
      key: 'gantt',
      icon: <CalendarOutlined />,
      label: 'Диаграмма Ганта',
    },
    {
      key: 'objects',
      icon: <AppstoreOutlined />,
      label: 'Объекты',
    },
    {
      key: 'chats',
      icon: <MessageOutlined />,
      label: 'Чаты',
    },
  ];

  return {
    handleMenuClick,
    getSelectedKeys,
    menuItems,
  };
};
