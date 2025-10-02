import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createMockUsers() {
  try {
    console.log('Creating mock users...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create ADMIN user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'Администратор Системы',
        role: 'ADMIN',
        mustChangePassword: false,
      },
    });

    // Create CONTRACTOR user
    const contractorUser = await prisma.user.upsert({
      where: { email: 'contractor@example.com' },
      update: {},
      create: {
        email: 'contractor@example.com',
        password: hashedPassword,
        fullName: 'Иванов И.И.',
        role: 'CONTRACTOR',
        mustChangePassword: false,
      },
    });

    // Create INSPECTOR user
    const inspectorUser = await prisma.user.upsert({
      where: { email: 'inspector@example.com' },
      update: {},
      create: {
        email: 'inspector@example.com',
        password: hashedPassword,
        fullName: 'Петров П.П.',
        role: 'INSPECTOR',
        mustChangePassword: false,
      },
    });

    console.log('Mock users created successfully:');
    console.log('ADMIN:', adminUser.email, '-', adminUser.fullName);
    console.log('CONTRACTOR:', contractorUser.email, '-', contractorUser.fullName);
    console.log('INSPECTOR:', inspectorUser.email, '-', inspectorUser.fullName);
    console.log('\nAll users have password: password123');

  } catch (error) {
    console.error('Error creating mock users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockUsers();
