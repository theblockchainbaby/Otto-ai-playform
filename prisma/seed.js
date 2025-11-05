const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
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
  console.log('✅ Created admin user:', admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
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
  console.log('✅ Created manager user:', manager.email);

  // Create sales rep user
  const salesPassword = await bcrypt.hash('sales123', 12);
  const salesRep = await prisma.user.upsert({
    where: { email: 'sales@ottoagent.net' },
    update: {},
    create: {
      email: 'sales@ottoagent.net',
      password: salesPassword,
      firstName: 'John',
      lastName: 'Sales',
      role: 'SALES_REP',
    },
  });
  console.log('✅ Created sales rep user:', salesRep.email);

  // Create some sample customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'michael.johnson@example.com' },
    update: {},
    create: {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.johnson@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      assignedToId: salesRep.id,
    },
  });
  console.log('✅ Created customer:', customer1.email);

  const customer2 = await prisma.customer.upsert({
    where: { email: 'sarah.williams@example.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      assignedToId: salesRep.id,
    },
  });
  console.log('✅ Created customer:', customer2.email);

  // Create some sample vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { vin: '5YJ3E1EA1KF123456' },
    update: {},
    create: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      vin: '5YJ3E1EA1KF123456',
      price: 45000,
      status: 'AVAILABLE',
      mileage: 0,
      color: 'Pearl White',
      description: 'Brand new Tesla Model 3 with Autopilot, premium interior, and long range battery',
      features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Heated Seats'],
    },
  });
  console.log('✅ Created vehicle:', vehicle1.make, vehicle1.model);

  const vehicle2 = await prisma.vehicle.upsert({
    where: { vin: 'WBAJB1C50KWW12345' },
    update: {},
    create: {
      make: 'BMW',
      model: 'X5',
      year: 2024,
      vin: 'WBAJB1C50KWW12345',
      price: 65000,
      status: 'AVAILABLE',
      mileage: 0,
      color: 'Black Sapphire',
      description: 'Luxury SUV with premium package, navigation, and advanced safety features',
      features: ['Navigation', 'Leather Seats', 'Panoramic Roof', 'Adaptive Cruise Control'],
    },
  });
  console.log('✅ Created vehicle:', vehicle2.make, vehicle2.model);

  // Create a sample lead
  const lead = await prisma.lead.create({
    data: {
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      assignedToId: salesRep.id,
      status: 'NEW',
      priority: 'HIGH',
      source: 'WEBSITE',
      notes: 'Interested in Tesla Model 3, wants to schedule test drive',
    },
  });
  console.log('✅ Created lead for:', customer1.firstName, customer1.lastName);

  // Create a sample appointment
  const appointmentStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000); // 1 hour later
  const appointment = await prisma.appointment.create({
    data: {
      title: 'Tesla Model 3 Test Drive',
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      assignedToId: salesRep.id,
      type: 'TEST_DRIVE',
      status: 'SCHEDULED',
      startTime: appointmentStart,
      endTime: appointmentEnd,
      duration: 60, // minutes
      location: 'Main Showroom',
      notes: 'Test drive for Tesla Model 3',
    },
  });
  console.log('✅ Created appointment for:', customer1.firstName, customer1.lastName);

  // Create a sample call
  const call = await prisma.call.create({
    data: {
      customerId: customer2.id,
      agentId: salesRep.id,
      direction: 'INBOUND',
      status: 'COMPLETED',
      duration: 320,
      sentiment: 'POSITIVE',
      summary: 'Customer inquired about BMW X5 pricing and availability',
      outcome: 'APPOINTMENT_SCHEDULED',
      notes: 'Very interested, scheduled for test drive next week',
    },
  });
  console.log('✅ Created call record');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@ottoagent.net / admin123');
  console.log('   Manager: manager@ottoagent.net / manager123');
  console.log('   Sales Rep: sales@ottoagent.net / sales123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

