import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const passwordHash = await hashPassword('Test@1234');

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@test.com' },
    update: {},
    create: {
      name: 'Test Citizen',
      email: 'citizen@test.com',
      passwordHash,
      phone: '+1234567890',
      role: 'CITIZEN',
    },
  });

  const police = await prisma.user.upsert({
    where: { email: 'police@test.com' },
    update: {},
    create: {
      name: 'Test Officer',
      email: 'police@test.com',
      passwordHash,
      phone: '+1234567891',
      role: 'POLICE',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash,
      phone: '+1234567892',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed data created:');
  console.log(`   - Citizen: ${citizen.email}`);
  console.log(`   - Police: ${police.email}`);
  console.log(`   - Admin: ${admin.email}`);
  console.log(`   - Password for all users: Test@1234`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });