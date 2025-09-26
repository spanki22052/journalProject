import type { ObjectChecklistType } from '@features/object-checklist';

export interface Organization {
  id: string;
  name: string;
  works: Work[];
}

export interface Work {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  assignee: string;
  parent?: string; // ID родительской задачи (объекта)
  isExpanded?: boolean; // Состояние раскрытия для объектов
}

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Строительная компания "Монолит"',
    works: [
      // Этап 1: Проектирование (2021-2022)
      {
        id: '1-1',
        name: 'Получение письма',
        startDate: new Date('2021-10-01'),
        endDate: new Date('2021-12-31'),
        progress: 100,
        type: 'task',
        assignee: 'Кузовков В. П.',
        parent: '1',
        dependencies: [],
      },
      {
        id: '1-2',
        name: 'Разработка схемы участка',
        startDate: new Date('2021-11-01'),
        endDate: new Date('2022-01-31'),
        progress: 100,
        type: 'task',
        assignee: 'Павеленко А. И.',
        parent: '1',
        dependencies: ['1-1'],
      },
      {
        id: '1-3',
        name: 'Смета на строительство',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-03-31'),
        progress: 100,
        type: 'task',
        assignee: 'Никушин Л. В.',
        parent: '1',
        dependencies: ['1-2'],
      },
      {
        id: '1-4',
        name: 'Концепция дизайна помещений',
        startDate: new Date('2022-02-01'),
        endDate: new Date('2022-05-31'),
        progress: 100,
        type: 'task',
        assignee: 'Павеленко А. И.',
        parent: '1',
        dependencies: ['1-3'],
      },
      {
        id: '1-5',
        name: 'Текстовая документация',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2022-06-30'),
        progress: 100,
        type: 'task',
        assignee: 'Акимов В. В.',
        parent: '1',
        dependencies: ['1-4'],
      },

      // Этап 2: Подготовка строительной площадки (2022)
      {
        id: '1-6',
        name: 'Демонтаж на территории',
        startDate: new Date('2022-07-01'),
        endDate: new Date('2022-09-30'),
        progress: 100,
        type: 'task',
        assignee: 'Лебедев Т. Н.',
        parent: '1',
        dependencies: ['1-5'],
      },

      // Этап 3: Строительные работы (2022-2023)
      {
        id: '1-7',
        name: 'Общестроительные работы',
        startDate: new Date('2022-10-01'),
        endDate: new Date('2023-02-28'),
        progress: 80,
        type: 'task',
        assignee: 'Никушин Л. В.',
        parent: '1',
        dependencies: ['1-6'],
      },
      {
        id: '1-8',
        name: 'Электромонтажные работы',
        startDate: new Date('2022-11-01'),
        endDate: new Date('2023-01-31'),
        progress: 90,
        type: 'task',
        assignee: 'Никулина М. А.',
        parent: '1',
        dependencies: ['1-7'],
      },

      // Этап 4: Отделочные работы (2023)
      {
        id: '1-9',
        name: 'Малярно-штукатурные работы',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-03-31'),
        progress: 100,
        type: 'task',
        assignee: 'Пантелеев Д. К.',
        parent: '1',
        dependencies: ['1-8'],
      },
      {
        id: '1-10',
        name: 'Декоративные и технические работы',
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-04-30'),
        progress: 75,
        type: 'task',
        assignee: 'Митрофанова Е. С.',
        parent: '1',
        dependencies: ['1-9'],
      },

      // Этап 5: Сдача объекта (2023)
      {
        id: '1-11',
        name: 'Выдача ключей',
        startDate: new Date('2023-05-01'),
        endDate: new Date('2023-06-30'),
        progress: 60,
        type: 'task',
        assignee: 'Павеленко А. И.',
        parent: '1',
        dependencies: ['1-10'],
      },
    ],
  },
  {
    id: '2',
    name: 'ООО "Ремонт-Сервис"',
    works: [
      // Этап 1: Проектирование (2021-2022)
      {
        id: '2-1',
        name: 'Получение письма',
        startDate: new Date('2021-11-01'),
        endDate: new Date('2022-01-31'),
        progress: 100,
        type: 'task',
        assignee: 'Смирнов А. В.',
        parent: '2',
        dependencies: [],
      },
      {
        id: '2-2',
        name: 'Разработка схемы участка',
        startDate: new Date('2021-12-01'),
        endDate: new Date('2022-02-28'),
        progress: 100,
        type: 'task',
        assignee: 'Козлов С. И.',
        parent: '2',
        dependencies: ['2-1'],
      },
      {
        id: '2-3',
        name: 'Смета на строительство',
        startDate: new Date('2022-02-01'),
        endDate: new Date('2022-04-30'),
        progress: 100,
        type: 'task',
        assignee: 'Волков М. Р.',
        parent: '2',
        dependencies: ['2-2'],
      },

      // Этап 2: Подготовка строительной площадки (2022)
      {
        id: '2-4',
        name: 'Демонтаж на территории',
        startDate: new Date('2022-08-01'),
        endDate: new Date('2022-10-31'),
        progress: 100,
        type: 'task',
        assignee: 'Смирнов А. В.',
        parent: '2',
        dependencies: ['2-3'],
      },

      // Этап 3: Строительные работы (2022-2023)
      {
        id: '2-5',
        name: 'Общестроительные работы',
        startDate: new Date('2022-11-01'),
        endDate: new Date('2023-03-31'),
        progress: 50,
        type: 'task',
        assignee: 'Волков М. Р.',
        parent: '2',
        dependencies: ['2-4'],
      },
      {
        id: '2-6',
        name: 'Электромонтажные работы',
        startDate: new Date('2022-12-01'),
        endDate: new Date('2023-02-28'),
        progress: 40,
        type: 'task',
        assignee: 'Козлов С. И.',
        parent: '2',
        dependencies: ['2-5'],
      },

      // Этап 4: Отделочные работы (2023)
      {
        id: '2-7',
        name: 'Малярно-штукатурные работы',
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-04-30'),
        progress: 30,
        type: 'task',
        assignee: 'Смирнов А. В.',
        parent: '2',
        dependencies: ['2-6'],
      },
      {
        id: '2-8',
        name: 'Декоративные и технические работы',
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-05-31'),
        progress: 30,
        type: 'task',
        assignee: 'Козлов С. И.',
        parent: '2',
        dependencies: ['2-7'],
      },

      // Этап 5: Сдача объекта (2023)
      {
        id: '2-9',
        name: 'Выдача ключей',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-07-31'),
        progress: 40,
        type: 'task',
        assignee: 'Волков М. Р.',
        parent: '2',
        dependencies: ['2-8'],
      },
    ],
  },
];

// Создаем объекты как родительские задачи
export const mockObjects = [
  {
    id: '1',
    name: 'Строительная компания "Монолит"',
    startDate: new Date('2021-10-01'),
    endDate: new Date('2023-06-30'),
    progress: 0,
    type: 'project' as const,
    assignee: '',
    isExpanded: true,
  },
  {
    id: '2',
    name: 'ООО "Ремонт-Сервис"',
    startDate: new Date('2021-11-01'),
    endDate: new Date('2023-07-31'),
    progress: 0,
    type: 'project' as const,
    assignee: '',
    isExpanded: false,
  },
];

export const mockWorks = [
  'Покраска стен',
  'Укладка плитки',
  'Установка сантехники',
  'Укладка полов',
  'Установка дверей',
  'Поклейка обоев',
  'Установка потолков',
  'Электромонтажные работы',
  'Установка окон',
  'Штукатурные работы',
];

// Моковые данные чеклистов для объектов
export const mockChecklists: ObjectChecklistType[] = [
  {
    id: 'checklist-1',
    objectId: '1',
    title: 'Основные задачи проекта',
    createdAt: new Date('2021-10-01'),
    updatedAt: new Date('2023-01-15'),
    items: [
      {
        id: 'item-1-1',
        text: 'Получить разрешение на строительство',
        completed: true,
        createdAt: new Date('2021-10-01'),
        completedAt: new Date('2021-11-15'),
      },
      {
        id: 'item-1-2',
        text: 'Завершить проектирование здания',
        completed: true,
        createdAt: new Date('2021-10-01'),
        completedAt: new Date('2022-01-30'),
      },
      {
        id: 'item-1-3',
        text: 'Подготовить строительную площадку',
        completed: true,
        createdAt: new Date('2021-10-01'),
        completedAt: new Date('2022-03-15'),
      },
      {
        id: 'item-1-4',
        text: 'Завершить фундаментные работы',
        completed: true,
        createdAt: new Date('2021-10-01'),
        completedAt: new Date('2022-06-30'),
      },
      {
        id: 'item-1-5',
        text: 'Возвести основные конструкции',
        completed: false,
        createdAt: new Date('2021-10-01'),
      },
      {
        id: 'item-1-6',
        text: 'Провести внутренние коммуникации',
        completed: false,
        createdAt: new Date('2021-10-01'),
      },
      {
        id: 'item-1-7',
        text: 'Выполнить отделочные работы',
        completed: false,
        createdAt: new Date('2021-10-01'),
      },
      {
        id: 'item-1-8',
        text: 'Сдать объект в эксплуатацию',
        completed: false,
        createdAt: new Date('2021-10-01'),
      },
    ],
  },
  {
    id: 'checklist-2',
    objectId: '2',
    title: 'Задачи ремонтного проекта',
    createdAt: new Date('2021-11-01'),
    updatedAt: new Date('2023-02-10'),
    items: [
      {
        id: 'item-2-1',
        text: 'Провести техническое обследование',
        completed: true,
        createdAt: new Date('2021-11-01'),
        completedAt: new Date('2021-12-15'),
      },
      {
        id: 'item-2-2',
        text: 'Разработать проект реконструкции',
        completed: true,
        createdAt: new Date('2021-11-01'),
        completedAt: new Date('2022-02-28'),
      },
      {
        id: 'item-2-3',
        text: 'Получить согласования',
        completed: true,
        createdAt: new Date('2021-11-01'),
        completedAt: new Date('2022-04-15'),
      },
      {
        id: 'item-2-4',
        text: 'Демонтировать старые конструкции',
        completed: false,
        createdAt: new Date('2021-11-01'),
      },
      {
        id: 'item-2-5',
        text: 'Выполнить ремонтные работы',
        completed: false,
        createdAt: new Date('2021-11-01'),
      },
      {
        id: 'item-2-6',
        text: 'Провести отделочные работы',
        completed: false,
        createdAt: new Date('2021-11-01'),
      },
      {
        id: 'item-2-7',
        text: 'Сдать объект заказчику',
        completed: false,
        createdAt: new Date('2021-11-01'),
      },
    ],
  },
];
