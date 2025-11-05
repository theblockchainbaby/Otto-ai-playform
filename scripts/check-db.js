#!/usr/bin/env node

/**
 * Database Connection Check Script
 * Run this to verify your database is properly configured
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.log('\nPlease set DATABASE_URL in your environment or .env file');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL is set');
    console.log(`   ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

    // Try to connect
    console.log('🔌 Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!\n');

    // Check tables
    console.log('📊 Checking database tables...');
    
    const customerCount = await prisma.customer.count();
    console.log(`✅ Customers table: ${customerCount} records`);

    const vehicleCount = await prisma.vehicle.count();
    console.log(`✅ Vehicles table: ${vehicleCount} records`);

    const appointmentCount = await prisma.appointment.count();
    console.log(`✅ Appointments table: ${appointmentCount} records`);

    const callRecordCount = await prisma.callRecord.count();
    console.log(`✅ Call Records table: ${callRecordCount} records`);

    const userCount = await prisma.user.count();
    console.log(`✅ Users table: ${userCount} records`);

    console.log('\n✅ Database is properly configured and working!');
    console.log('🎉 All checks passed!\n');

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check that DATABASE_URL is correct');
      console.log('   - Verify database server is running');
      console.log('   - Check network connectivity');
    } else if (error.code === 'P1003') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Database exists but cannot be reached');
      console.log('   - Check firewall settings');
      console.log('   - Verify database credentials');
    } else if (error.code === 'P2021') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Table does not exist');
      console.log('   - Run: npm run prisma:migrate');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

