import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createMockContractors() {
  try {
    console.log('Creating mock contractors...');

    // Hash password for all contractors
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Mock contractors data (from the original mockAssignees)
    const mockContractors = [
      {
        email: 'kuzovkov@example.com',
        fullName: 'Кузовков В. П.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'pavelenko@example.com',
        fullName: 'Павеленко А. И.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'nikushin@example.com',
        fullName: 'Никушин Л. В.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'akimov@example.com',
        fullName: 'Акимов В. В.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'lebedev@example.com',
        fullName: 'Лебедев Т. Н.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'nikulina@example.com',
        fullName: 'Никулина М. А.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'panteleev@example.com',
        fullName: 'Пантелеев Д. К.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'mitrofanova@example.com',
        fullName: 'Митрофанова Е. С.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'smirnov@example.com',
        fullName: 'Смирнов А. В.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'kozlov@example.com',
        fullName: 'Козлов С. И.',
        role: 'CONTRACTOR' as const,
      },
      {
        email: 'volkov@example.com',
        fullName: 'Волков М. Р.',
        role: 'CONTRACTOR' as const,
      },
    ];

    // Create contractors
    const createdContractors = [];
    for (const contractorData of mockContractors) {
      const contractor = await prisma.user.upsert({
        where: { email: contractorData.email },
        update: {},
        create: {
          email: contractorData.email,
          password: hashedPassword,
          fullName: contractorData.fullName,
          role: contractorData.role,
          mustChangePassword: false,
        },
      });
      createdContractors.push(contractor);
      console.log(`✅ Created contractor: ${contractor.fullName} (${contractor.email})`);
    }

    console.log('\n🎉 Mock contractors created successfully!');
    console.log(`Created ${createdContractors.length} contractors`);
    console.log('\nAll contractors have password: password123');

  } catch (error) {
    console.error('Error creating mock contractors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockContractors();
