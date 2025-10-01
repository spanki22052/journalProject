import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Начинаем seeding базы данных...');

  try {
    // Проверяем, есть ли уже супер-админ
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Супер-админ уже существует:', existingAdmin.email);
      return;
    }

    // Создаем супер-админа
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@system.local',
        password: hashedPassword,
        fullName: 'Супер-администратор',
        role: 'ADMIN',
        mustChangePassword: true, // Принудительная смена пароля после первого входа
      },
    });

    console.log('✅ Супер-админ создан:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Пароль: ${superAdminPassword}`);
    console.log(`   ID: ${superAdmin.id}`);
    console.log('');
    console.log('⚠️  ВАЖНО: Смените пароль после первого входа!');

  } catch (error) {
    console.error('❌ Ошибка при создании супер-админа:', error);
    throw error;
  }
}

async function main() {
  try {
    await seed();
    console.log('🎉 Seeding завершен успешно!');
  } catch (error) {
    console.error('💥 Ошибка seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
