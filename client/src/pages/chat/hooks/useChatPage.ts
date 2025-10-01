import { useState, useEffect } from 'react';
import { MessageType, CheckListType } from '../../../shared/api/types';

export const useChatPage = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [checkListItems, setCheckListItems] = useState<CheckListType[]>([]);

  useEffect(() => {
    const mockMessages: MessageType[] = [
      {
        id: 8,
        title: '',
        sender: { id: 1, name: 'Иван Петров', avatar: undefined },
        timestamp: new Date('2024-01-15T10:55:00'),
        taskId: 'TASK-214325',
        taskName: 'Купить люк',
        recognizedInfo:
          'ТТН #214325\nПриобретен Люк канализационный x1\nСумма: 1500\nПродавец: ООО “Леруа Мерлен”',
        files: [
          'https://images.unsplash.com/photo-1520975922284-9d09b4510045?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1588771930290-24a0d056f9b8?q=80&w=600&auto=format&fit=crop',
        ],
      },
    ];

    const mockCheckListItems: CheckListType[] = [
      {
        id: 1,
        text: 'Проверить техническое задание',
        status: 'approved',
      },
      {
        id: 2,
        text: 'Создать архитектуру проекта',
        status: 'underApproval',
      },
      {
        id: 3,
        text: 'Настроить CI/CD',
        status: 'open',
      },
      {
        id: 4,
        text: 'Провести тестирование',
        status: 'open',
      },
      {
        id: 5,
        text: 'Подготовить документацию',
        status: 'open',
      },
    ];

    setMessages(mockMessages);
    setCheckListItems(mockCheckListItems);
  }, []);

  return {
    messages,
    checkListItems,
    setMessages,
    setCheckListItems,
  };
};
