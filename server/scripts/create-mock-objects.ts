import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMockObjects() {
  try {
    console.log('Creating mock objects...');

    // Mock objects data
    const mockObjects = [
      {
        name: 'Покраска клумбы — Кулакова, 5',
        description: 'Покраска клумбы в жилом районе по адресу Кулакова, 5',
        type: 'PROJECT' as const,
        assignee: 'Кузовков В. П.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        progress: 75,
        isExpanded: true,
        polygon: 'POLYGON((37.6173 55.7558, 37.6183 55.7558, 37.6183 55.7568, 37.6173 55.7568, 37.6173 55.7558))',
      },
      {
        name: 'Починка люка — Неманский, 11',
        description: 'Ремонт канализационного люка по адресу Неманский, 11',
        type: 'PROJECT' as const,
        assignee: 'Павеленко А. И.',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-03-20'),
        progress: 30,
        isExpanded: false,
        polygon: 'POLYGON((37.6273 55.7658, 37.6283 55.7658, 37.6283 55.7668, 37.6273 55.7668, 37.6273 55.7658))',
      },
      {
        name: 'Установка фонарей — Ленина, 42',
        description: 'Установка уличных фонарей по улице Ленина, дом 42',
        type: 'PROJECT' as const,
        assignee: 'Никушин Л. В.',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        progress: 0,
        isExpanded: false,
        polygon: 'POLYGON((37.6373 55.7758, 37.6383 55.7758, 37.6383 55.7768, 37.6373 55.7768, 37.6373 55.7758))',
      },
      {
        name: 'Ремонт дороги — Центральная, 15-25',
        description: 'Капитальный ремонт дорожного покрытия на участке Центральная, дома 15-25',
        type: 'PROJECT' as const,
        assignee: 'Акимов В. В.',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-06-15'),
        progress: 10,
        isExpanded: false,
        polygon: 'POLYGON((37.6473 55.7858, 37.6483 55.7858, 37.6483 55.7868, 37.6473 55.7868, 37.6473 55.7858))',
      },
      {
        name: 'Озеленение парка — Парковая, 1',
        description: 'Посадка деревьев и кустарников в городском парке',
        type: 'PROJECT' as const,
        assignee: 'Лебедев Т. Н.',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        progress: 0,
        isExpanded: false,
        polygon: 'POLYGON((37.6573 55.7958, 37.6583 55.7958, 37.6583 55.7968, 37.6573 55.7968, 37.6573 55.7958))',
      },
    ];

    // Create objects
    const createdObjects = [];
    for (const objectData of mockObjects) {
      // Check if object already exists
      const existingObject = await prisma.object.findFirst({
        where: { name: objectData.name },
      });
      
      let object;
      if (existingObject) {
        object = existingObject;
        console.log(`✅ Object already exists: ${object.name}`);
      } else {
        object = await prisma.object.create({
          data: objectData,
        });
        console.log(`✅ Created object: ${object.name}`);
      }
      createdObjects.push(object);
    }

    // Create checklists for each object
    for (const object of createdObjects) {
      // Check if checklist already exists
      const existingChecklist = await prisma.checklist.findFirst({
        where: { 
          objectId: object.id,
          title: `Чеклист для ${object.name}`
        }
      });
      
      let checklist;
      if (existingChecklist) {
        checklist = existingChecklist;
        console.log(`✅ Checklist already exists for object: ${object.name}`);
      } else {
        checklist = await prisma.checklist.create({
          data: {
            objectId: object.id,
            title: `Чеклист для ${object.name}`,
          },
        });
        console.log(`✅ Created checklist for object: ${object.name}`);
      }

      // Create checklist items
      const checklistItems = [
        {
          text: 'Подготовка рабочего места',
          completed: object.progress > 0,
        },
        {
          text: 'Закупка материалов',
          completed: object.progress > 25,
        },
        {
          text: 'Выполнение основных работ',
          completed: object.progress > 50,
        },
        {
          text: 'Контроль качества',
          completed: object.progress > 75,
        },
        {
          text: 'Сдача объекта',
          completed: object.progress === 100,
        },
      ];

      for (const itemData of checklistItems) {
        // Check if checklist item already exists
        const existingItem = await prisma.checklistItem.findFirst({
          where: {
            checklistId: checklist.id,
            text: itemData.text,
          }
        });
        
        if (!existingItem) {
          await prisma.checklistItem.create({
            data: {
              checklistId: checklist.id,
              text: itemData.text,
              completed: itemData.completed,
              completedAt: itemData.completed ? new Date() : null,
            },
          });
        }
      }

    }

    // Create chats for objects (this will automatically create chat messages)
    for (const object of createdObjects) {
      // Check if chat already exists
      const existingChat = await prisma.chat.findUnique({
        where: { objectId: object.id },
      });
      
      let chat;
      if (existingChat) {
        chat = existingChat;
        console.log(`✅ Chat already exists for object: ${object.name}`);
      } else {
        chat = await prisma.chat.create({
          data: {
            objectId: object.id,
          },
        });
        console.log(`✅ Created chat for object: ${object.name}`);
      }

      // Create some initial chat messages
      const messages = [
        {
          content: `Начат проект: ${object.name}`,
          type: 'SYSTEM' as const,
          author: 'Система',
        },
        {
          content: `Ответственный: ${object.assignee}`,
          type: 'TEXT' as const,
          author: 'Администратор',
        },
        {
          content: `Прогресс выполнения: ${object.progress}%`,
          type: 'TEXT' as const,
          author: 'Система',
        },
      ];

      for (const messageData of messages) {
        // Check if message already exists
        const existingMessage = await prisma.chatMessage.findFirst({
          where: {
            chatId: chat.id,
            content: messageData.content,
          }
        });
        
        if (!existingMessage) {
          await prisma.chatMessage.create({
            data: {
              chatId: chat.id,
              content: messageData.content,
              type: messageData.type,
              author: messageData.author,
            },
          });
        }
      }
    }

    console.log('\n🎉 Mock objects created successfully!');
    console.log(`Created ${createdObjects.length} objects with checklists and chats`);

  } catch (error) {
    console.error('Error creating mock objects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockObjects();
