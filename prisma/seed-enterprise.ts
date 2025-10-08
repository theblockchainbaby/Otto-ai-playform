import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper functions for generating realistic data
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
}

function getRandomEmail(firstName: string, lastName: string, index: number): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'];
    const separators = ['.', '_', ''];
    const separator = getRandomElement(separators);
    const domain = getRandomElement(domains);
    const randomNum = Math.floor(Math.random() * 1000);
    return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${index}${randomNum}@${domain}`;
}

// Enterprise data arrays
const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
    'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
    'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
    'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Timothy', 'Dorothy',
    'Ronald', 'Lisa', 'Jason', 'Nancy', 'Edward', 'Karen', 'Jeffrey', 'Betty', 'Ryan', 'Helen',
    'Jacob', 'Sandra', 'Gary', 'Donna', 'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon',
    'Stephen', 'Michelle', 'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
    'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
    'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper'
];

const cities = [
    { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
    { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
    { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
    { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
    { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
    { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
    { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 }
];

const vehicleMakes = [
    { make: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'CLS', 'G-Class'] },
    { make: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'i4', 'iX', 'Z4', '8 Series'] },
    { make: 'Audi', models: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT'] },
    { make: 'Lexus', models: ['ES', 'IS', 'LS', 'GS', 'RX', 'GX', 'LX', 'NX', 'UX', 'LC'] },
    { make: 'Porsche', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'] },
    { make: 'Jaguar', models: ['XE', 'XF', 'XJ', 'F-PACE', 'E-PACE', 'I-PACE', 'F-TYPE'] },
    { make: 'Land Rover', models: ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Discovery', 'Defender'] },
    { make: 'Cadillac', models: ['CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6', 'Escalade', 'LYRIQ'] },
    { make: 'Genesis', models: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'] },
    { make: 'Volvo', models: ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'C40', 'EX30'] }
];

const colors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Brown', 'Gold', 'Green', 'Beige'];

const streetNames = [
    'Main St', 'Oak Ave', 'Pine St', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Park Ave', 'First St', 'Second St', 'Third St',
    'Washington St', 'Lincoln Ave', 'Jefferson Dr', 'Madison St', 'Monroe Ave', 'Adams St', 'Jackson Dr', 'Van Buren St',
    'Harrison Ave', 'Tyler St', 'Polk Dr', 'Taylor Ave', 'Fillmore St', 'Pierce Dr', 'Buchanan Ave', 'Johnson St'
];

const serviceProviderNames = [
    'Elite Roadside Services', 'Premium Auto Rescue', 'Luxury Vehicle Recovery', 'Metropolitan Towing', 'City Wide Auto Services',
    'Express Emergency Response', 'Professional Roadside Assistance', 'Rapid Response Towing', 'Superior Auto Care',
    'Advanced Vehicle Services', 'Premier Emergency Response', 'Executive Auto Assistance', 'Platinum Roadside Services',
    'Diamond Auto Recovery', 'Gold Standard Towing', 'First Class Vehicle Services', 'VIP Emergency Response',
    'Prestige Auto Assistance', 'Crown Roadside Services', 'Royal Auto Recovery', 'Imperial Towing Services',
    'Sovereign Vehicle Assistance', 'Regal Emergency Response', 'Noble Auto Services', 'Majestic Roadside Recovery'
];

async function main() {
    console.log('🚀 Starting enterprise data seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.serviceReview.deleteMany();
    await prisma.serviceStatusUpdate.deleteMany();
    await prisma.serviceRequest.deleteMany();
    await prisma.serviceProvider.deleteMany();
    await prisma.emergencyCall.deleteMany();
    await prisma.campaignStepExecution.deleteMany();
    await prisma.campaignExecution.deleteMany();
    await prisma.campaignStep.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.task.deleteMany();
    await prisma.message.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.call.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    // Create admin users
    console.log('👥 Creating admin users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUsers = [
        { firstName: 'John', lastName: 'Anderson', email: 'john.anderson@autolux.com', role: 'ADMIN' },
        { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@autolux.com', role: 'MANAGER' },
        { firstName: 'Michael', lastName: 'Thompson', email: 'michael.thompson@autolux.com', role: 'SALES_REP' },
        { firstName: 'Emily', lastName: 'Rodriguez', email: 'emily.rodriguez@autolux.com', role: 'SALES_REP' },
        { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@autolux.com', role: 'SALES_REP' },
        { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@autolux.com', role: 'SUPPORT' },
        { firstName: 'Robert', lastName: 'Brown', email: 'robert.brown@autolux.com', role: 'SUPPORT' },
        { firstName: 'Jennifer', lastName: 'Davis', email: 'jennifer.davis@autolux.com', role: 'SUPPORT' }
    ];

    const users = [];
    for (const userData of adminUsers) {
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword
            }
        });
        users.push(user);
    }

    console.log(`✅ Created ${users.length} admin users`);

    // Create service providers
    console.log('🏢 Creating service providers...');
    const serviceProviders = [];
    for (let i = 0; i < 50; i++) {
        const city = getRandomElement(cities);
        const providerName = getRandomElement(serviceProviderNames);
        const types = ['TOWING_COMPANY', 'MOBILE_MECHANIC', 'TIRE_SERVICE', 'LOCKSMITH', 'FUEL_DELIVERY', 'BATTERY_SERVICE', 'GENERAL_ROADSIDE', 'EMERGENCY_RESPONSE'];
        const serviceTypes = ['TOWING', 'JUMP_START', 'TIRE_CHANGE', 'LOCKOUT_SERVICE', 'FUEL_DELIVERY', 'MECHANICAL_REPAIR', 'WINCH_OUT', 'BATTERY_REPLACEMENT', 'EMERGENCY_REPAIR', 'ACCIDENT_ASSISTANCE'];
        
        const provider = await prisma.serviceProvider.create({
            data: {
                name: `${providerName} ${i + 1}`,
                type: getRandomElement(types),
                phone: getRandomPhoneNumber(),
                email: `contact@${providerName.toLowerCase().replace(/\s+/g, '')}${i + 1}.com`,
                address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streetNames)}`,
                city: city.name,
                state: city.state,
                zipCode: String(Math.floor(Math.random() * 90000) + 10000),
                serviceRadius: Math.floor(Math.random() * 50) + 10,
                latitude: city.lat + (Math.random() - 0.5) * 0.5,
                longitude: city.lng + (Math.random() - 0.5) * 0.5,
                services: Array.from(new Set(Array.from({length: Math.floor(Math.random() * 5) + 2}, () => getRandomElement(serviceTypes)))),
                isActive: Math.random() > 0.1,
                isAvailable: Math.random() > 0.2,
                averageRating: Math.random() * 2 + 3, // 3-5 stars
                totalJobs: Math.floor(Math.random() * 500) + 50,
                hoursOfOperation: {
                    monday: { open: '06:00', close: '22:00' },
                    tuesday: { open: '06:00', close: '22:00' },
                    wednesday: { open: '06:00', close: '22:00' },
                    thursday: { open: '06:00', close: '22:00' },
                    friday: { open: '06:00', close: '22:00' },
                    saturday: { open: '08:00', close: '20:00' },
                    sunday: { open: '08:00', close: '18:00' }
                }
            }
        });
        serviceProviders.push(provider);
    }

    console.log(`✅ Created ${serviceProviders.length} service providers`);

    // Create customers
    console.log('👥 Creating customers...');
    const customers = [];
    for (let i = 0; i < 500; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const city = getRandomElement(cities);
        
        const customer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email: getRandomEmail(firstName, lastName, i),
                phone: getRandomPhoneNumber(),
                address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streetNames)}`,
                city: city.name,
                state: city.state,
                zipCode: String(Math.floor(Math.random() * 90000) + 10000),
                dateOfBirth: getRandomDate(new Date('1950-01-01'), new Date('2000-12-31')),
                assignedToId: getRandomElement(users).id
            }
        });
        customers.push(customer);
    }

    console.log(`✅ Created ${customers.length} customers`);

    console.log('🚗 Creating vehicles...');
    const vehicles = [];
    for (let i = 0; i < 800; i++) {
        const vehicleMake = getRandomElement(vehicleMakes);
        const year = Math.floor(Math.random() * 10) + 2015; // 2015-2024
        
        const vehicle = await prisma.vehicle.create({
            data: {
                vin: `1HGBH41JXMN${String(Math.floor(Math.random() * 900000) + 100000)}`,
                make: vehicleMake.make,
                model: getRandomElement(vehicleMake.models),
                year,
                color: getRandomElement(colors),
                mileage: Math.floor(Math.random() * 100000) + 5000,
                price: Math.floor(Math.random() * 80000) + 30000,
                status: getRandomElement(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']),
                description: `Luxury ${vehicleMake.make} in excellent condition with premium features`,
                features: ['Leather Seats', 'Navigation System', 'Premium Sound', 'Sunroof', 'Heated Seats'],
                customerId: Math.random() > 0.3 ? getRandomElement(customers).id : null
            }
        });
        vehicles.push(vehicle);
    }

    console.log(`✅ Created ${vehicles.length} vehicles`);

    console.log('🎯 Creating leads...');
    const leads = [];
    for (let i = 0; i < 300; i++) {
        const customer = getRandomElement(customers);
        const vehicle = getRandomElement(vehicles);
        
        const lead = await prisma.lead.create({
            data: {
                source: getRandomElement(['WEBSITE', 'PHONE_CALL', 'EMAIL', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'ADVERTISEMENT']),
                status: getRandomElement(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
                priority: getRandomElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
                notes: `Interested in ${vehicle.make} ${vehicle.model}. Customer looking for luxury vehicle with premium features.`,
                customerId: customer.id,
                vehicleId: vehicle.id,
                assignedToId: getRandomElement(users).id
            }
        });
        leads.push(lead);
    }

    console.log(`✅ Created ${leads.length} leads`);

    console.log('📞 Creating calls...');
    for (let i = 0; i < 600; i++) {
        const customer = getRandomElement(customers);
        const callDate = getRandomDate(new Date('2024-01-01'), new Date());
        
        await prisma.call.create({
            data: {
                direction: getRandomElement(['INBOUND', 'OUTBOUND']),
                status: getRandomElement(['INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER']),
                outcome: getRandomElement(['SUCCESSFUL', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'CALLBACK_REQUESTED']),
                duration: Math.floor(Math.random() * 1800) + 60, // 1-30 minutes
                notes: 'Customer inquiry about vehicle availability and pricing. Discussed financing options.',
                sentiment: getRandomElement(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
                startedAt: callDate,
                endedAt: new Date(callDate.getTime() + Math.floor(Math.random() * 1800) * 1000),
                customerId: customer.id,
                agentId: getRandomElement(users).id
            }
        });
    }

    console.log('✅ Created 600 calls');

    console.log('📅 Creating appointments...');
    for (let i = 0; i < 200; i++) {
        const customer = getRandomElement(customers);
        const vehicle = getRandomElement(vehicles);
        const startTime = getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Next 30 days
        const durationMinutes = (Math.floor(Math.random() * 3) + 1) * 60; // 1-3 hours in minutes
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        await prisma.appointment.create({
            data: {
                title: `${getRandomElement(['Vehicle Viewing', 'Test Drive', 'Delivery', 'Service Consultation', 'Sales Meeting'])} - ${vehicle.make} ${vehicle.model}`,
                description: `Appointment for ${customer.firstName} ${customer.lastName} regarding ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                type: getRandomElement(['SALES_CONSULTATION', 'TEST_DRIVE', 'VEHICLE_DELIVERY', 'SERVICE_APPOINTMENT', 'FINANCING_MEETING', 'TRADE_IN_APPRAISAL', 'FOLLOW_UP_MEETING', 'PHONE_CONSULTATION']),
                status: getRandomElement(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
                startTime,
                endTime,
                duration: durationMinutes,
                location: 'AutoLux Showroom',
                customerId: customer.id,
                vehicleId: vehicle.id,
                assignedToId: getRandomElement(users).id
            }
        });
    }

    console.log('✅ Created 200 appointments');

    console.log('🚨 Creating emergency calls...');
    for (let i = 0; i < 150; i++) {
        const customer = getRandomElement(customers);
        const vehicle = customer.vehicles?.[0] || getRandomElement(vehicles);
        const city = getRandomElement(cities);
        const callDate = getRandomDate(new Date('2024-01-01'), new Date());
        
        await prisma.emergencyCall.create({
            data: {
                callType: getRandomElement(['BREAKDOWN', 'ACCIDENT', 'FLAT_TIRE', 'DEAD_BATTERY', 'LOCKOUT', 'OUT_OF_FUEL', 'OVERHEATING', 'TOWING_REQUEST', 'MECHANICAL_ISSUE', 'OTHER']),
                priority: getRandomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'LIFE_THREATENING']),
                status: getRandomElement(['RECEIVED', 'TRIAGED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
                latitude: city.lat + (Math.random() - 0.5) * 0.1,
                longitude: city.lng + (Math.random() - 0.5) * 0.1,
                address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streetNames)}, ${city.name}, ${city.state}`,
                description: 'Vehicle breakdown on highway. Customer reports engine trouble and needs immediate assistance.',
                symptoms: 'Engine making unusual noises, smoke from hood, vehicle unable to start',
                vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color}`,
                receivedAt: callDate,
                customerId: customer.id,
                vehicleId: vehicle.id,
                handlerId: getRandomElement(users).id
            }
        });
    }

    console.log('✅ Created 150 emergency calls');

    console.log('🔧 Creating service requests...');
    for (let i = 0; i < 200; i++) {
        const customer = getRandomElement(customers);
        const vehicle = customer.vehicles?.[0] || getRandomElement(vehicles);
        const provider = getRandomElement(serviceProviders);
        const city = getRandomElement(cities);
        const requestDate = getRandomDate(new Date('2024-01-01'), new Date());
        
        await prisma.serviceRequest.create({
            data: {
                requestNumber: `SR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                type: getRandomElement(['TOWING', 'JUMP_START', 'TIRE_CHANGE', 'LOCKOUT_SERVICE', 'FUEL_DELIVERY', 'MECHANICAL_REPAIR', 'WINCH_OUT', 'BATTERY_REPLACEMENT', 'EMERGENCY_REPAIR', 'ACCIDENT_ASSISTANCE']),
                priority: getRandomElement(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
                status: getRandomElement(['PENDING', 'ASSIGNED', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
                latitude: city.lat + (Math.random() - 0.5) * 0.1,
                longitude: city.lng + (Math.random() - 0.5) * 0.1,
                address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(streetNames)}, ${city.name}, ${city.state}`,
                description: 'Customer requires roadside assistance for vehicle issue',
                estimatedCost: Math.floor(Math.random() * 300) + 50,
                actualCost: Math.floor(Math.random() * 350) + 75,
                customerRating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
                requestedAt: requestDate,
                customerId: customer.id,
                vehicleId: vehicle.id,
                serviceProviderId: provider.id,
                assignedToId: getRandomElement(users).id,
                dispatcherId: getRandomElement(users).id
            }
        });
    }

    console.log('✅ Created 200 service requests');

    console.log('🎉 Enterprise data seeding completed successfully!');
    console.log(`
📊 Summary:
- ${users.length} Admin Users
- ${serviceProviders.length} Service Providers  
- ${customers.length} Customers
- ${vehicles.length} Vehicles
- ${leads.length} Leads
- 600 Calls
- 200 Appointments
- 150 Emergency Calls
- 200 Service Requests

🚀 Your AutoLux Intelligence Platform is now loaded with enterprise-level data!
    `);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
