import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ottoagent.net' },
    update: {},
    create: {
      email: 'admin@ottoagent.net',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  await prisma.user.upsert({
    where: { email: 'manager@ottoagent.net' },
    update: {},
    create: {
      email: 'manager@ottoagent.net',
      password: managerPassword,
      firstName: 'Sales',
      lastName: 'Manager',
      role: 'MANAGER',
    },
  });

  // Create sales rep users
  const salesRepPassword = await bcrypt.hash('sales123', 12);
  const salesRep1 = await prisma.user.upsert({
    where: { email: 'john.anderson@ottoagent.net' },
    update: {},
    create: {
      email: 'john.anderson@ottoagent.net',
      password: salesRepPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'SALES_REP',
    },
  });

  const salesRep2 = await prisma.user.upsert({
    where: { email: 'jane.smith@ottoagent.net' },
    update: {},
    create: {
      email: 'jane.smith@ottoagent.net',
      password: salesRepPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'SALES_REP',
    },
  });

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@email.com',
      phone: '+1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      assignedToId: salesRep1.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@email.com',
      phone: '+1987654321',
      address: '456 Oak Ave',
      city: 'Somewhere',
      state: 'TX',
      zipCode: '67890',
      assignedToId: salesRep2.id,
    },
  });

  // Create sample vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      vin: '1HGBH41JXMN109186',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      color: 'Blue',
      mileage: 15000,
      price: 25000,
      status: 'AVAILABLE',
      description: 'Excellent condition, one owner',
      features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay'],
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      vin: '1FTFW1ET5DFC12345',
      make: 'Ford',
      model: 'F-150',
      year: 2022,
      color: 'Red',
      mileage: 25000,
      price: 35000,
      status: 'AVAILABLE',
      description: 'Work truck, well maintained',
      features: ['4WD', 'Towing Package', 'Crew Cab'],
    },
  });

  // Create sample leads
  const lead1 = await prisma.lead.create({
    data: {
      customerId: customer1.id,
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'HIGH',
      notes: 'Interested in Honda Civic, looking for financing options',
      assignedToId: salesRep1.id,
      vehicleId: vehicle1.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      customerId: customer2.id,
      source: 'PHONE_CALL',
      status: 'CONTACTED',
      priority: 'MEDIUM',
      notes: 'Called about Ford F-150, wants to schedule test drive',
      assignedToId: salesRep2.id,
      vehicleId: vehicle2.id,
    },
  });

  // Create sample calls
  await prisma.call.create({
    data: {
      customerId: customer1.id,
      agentId: salesRep1.id,
      leadId: lead1.id,
      direction: 'OUTBOUND',
      status: 'COMPLETED',
      duration: 300, // 5 minutes
      summary: 'Discussed financing options for Honda Civic. Customer interested in 60-month loan.',
      sentiment: 'positive',
      outcome: 'Follow-up scheduled for tomorrow',
      notes: 'Customer seems very interested, good credit score',
    },
  });

  await prisma.call.create({
    data: {
      customerId: customer2.id,
      agentId: salesRep2.id,
      leadId: lead2.id,
      direction: 'INBOUND',
      status: 'COMPLETED',
      duration: 180, // 3 minutes
      summary: 'Customer called to schedule test drive for Ford F-150.',
      sentiment: 'neutral',
      outcome: 'Test drive scheduled for Saturday',
      notes: 'Customer available weekends only',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user: admin@otto.ai / admin123');
  console.log('👤 Manager user: manager@otto.ai / manager123');
  console.log('👤 Sales rep 1: john.anderson@otto.ai / sales123');
  console.log('👤 Sales rep 2: jane.smith@otto.ai / sales123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
