import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';

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
      default:
        break;
    }
  };

  const getSelectedKeys = () => {
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
  ];

  return {
    handleMenuClick,
    getSelectedKeys,
    menuItems,
  };
};
