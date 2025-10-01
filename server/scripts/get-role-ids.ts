import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getRoleIds() {
  console.log('🔍 Получение ID ролей...');

  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log('\n📋 ID ролей для .env файла:');
    console.log('=====================================');
    
    roles.forEach(role => {
      const envVarName = role.name.toUpperCase() + '_ROLE_ID';
      console.log(`${envVarName}="${role.id}"`);
    });

    console.log('\n📝 Скопируйте эти строки в ваш .env файл');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Ошибка при получении ролей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getRoleIds();
