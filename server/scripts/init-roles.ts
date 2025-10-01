import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initRoles() {
  console.log('🚀 Инициализация базовых ролей...');

  const defaultRoles = [
    { name: 'admin' },
    { name: 'contractor' },
    { name: 'organ_control' },
  ];

  for (const roleData of defaultRoles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      });

      if (existingRole) {
        console.log(`✅ Роль "${roleData.name}" уже существует`);
      } else {
        const role = await prisma.role.create({
          data: roleData
        });
        console.log(`✅ Создана роль: ${role.name} (ID: ${role.id})`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при создании роли "${roleData.name}":`, error);
    }
  }

  console.log('🎉 Инициализация ролей завершена!');
}

async function main() {
  try {
    await initRoles();
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
