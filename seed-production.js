const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'john.anderson@autolux.com' },
      update: {},
      create: {
        email: 'john.anderson@autolux.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Anderson',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin user created:', user.email);

    // Create a test customer
    const customer = await prisma.customer.upsert({
      where: { email: 'test@customer.com' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@customer.com',
        phone: '+19163337305',
        address: '123 Test St',
        city: 'Sacramento',
        state: 'CA',
        zipCode: '95814',
      },
    });

    console.log('✅ Test customer created:', customer.email);

    console.log('🎉 Production database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

