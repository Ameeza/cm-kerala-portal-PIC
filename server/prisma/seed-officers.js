
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const password = 'Demo@12345';

const officerAccounts = [
  {
    name: 'Public Works Officer',
    email: 'officer@cmkerala.demo',
    department: 'Public Works Department'
  },
  {
    name: 'Transport Officer',
    email: 'transport.officer@cmkerala.demo',
    department: 'Transport Department'
  },
  {
    name: 'Water Resources Officer',
    email: 'water.officer@cmkerala.demo',
    department: 'Water Resources'
  },
  {
    name: 'Power Department Officer',
    email: 'power.officer@cmkerala.demo',
    department: 'Power Department'
  },
  {
    name: 'Education Officer',
    email: 'education.officer@cmkerala.demo',
    department: 'General Education'
  },
  {
    name: 'Health Department Officer',
    email: 'health.officer@cmkerala.demo',
    department: 'Health and Family Welfare'
  },
  {
    name: 'Local Self Government Officer',
    email: 'localgov.officer@cmkerala.demo',
    department: 'Local Self Government'
  },
  {
    name: 'Revenue Department Officer',
    email: 'revenue.officer@cmkerala.demo',
    department: 'Revenue Department'
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);

  for (const officer of officerAccounts) {
    const department = await prisma.department.findUnique({
      where: { name: officer.department }
    });

    if (!department) {
      throw new Error(
        `Department not found in database: ${officer.department}`
      );
    }

    await prisma.user.upsert({
      where: { email: officer.email },
      update: {
        name: officer.name,
        role: 'OFFICER',
        departmentId: department.id,
        passwordHash
      },
      create: {
        name: officer.name,
        email: officer.email,
        role: 'OFFICER',
        departmentId: department.id,
        passwordHash
      }
    });

    console.log(
      `Created/updated: ${officer.email} → ${officer.department}`
    );
  }

  console.log('\nAll department officer accounts are ready.');
}

main()
  .catch(error => {
    console.error('Officer account setup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
