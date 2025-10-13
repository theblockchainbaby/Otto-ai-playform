import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Seed users
    const user1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            password: 'hashed_password_1', // Replace with a hashed password
            role: 'ADMIN',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            password: 'hashed_password_2', // Replace with a hashed password
            role: 'USER',
        },
    });

    // Seed customers
    const customer1 = await prisma.customer.create({
        data: {
            name: 'Alice Johnson',
            phone: '123-456-7890',
            email: 'alice.johnson@example.com',
        },
    });

    const customer2 = await prisma.customer.create({
        data: {
            name: 'Bob Brown',
            phone: '987-654-3210',
            email: 'bob.brown@example.com',
        },
    });

    // Seed vehicles
    const vehicle1 = await prisma.vehicle.create({
        data: {
            make: 'Tesla',
            model: 'Model S',
            year: 2022,
            price: 79999,
        },
    });

    const vehicle2 = await prisma.vehicle.create({
        data: {
            make: 'BMW',
            model: 'X5',
            year: 2021,
            price: 59999,
        },
    });

    // Seed leads
    const lead1 = await prisma.lead.create({
        data: {
            customerId: customer1.id,
            vehicleId: vehicle1.id,
            status: 'INTERESTED',
        },
    });

    const lead2 = await prisma.lead.create({
        data: {
            customerId: customer2.id,
            vehicleId: vehicle2.id,
            status: 'CONTACTED',
        },
    });

    // Seed appointments
    const appointment1 = await prisma.appointment.create({
        data: {
            customerId: customer1.id,
            vehicleId: vehicle1.id,
            date: new Date(),
            status: 'SCHEDULED',
        },
    });

    const appointment2 = await prisma.appointment.create({
        data: {
            customerId: customer2.id,
            vehicleId: vehicle2.id,
            date: new Date(),
            status: 'COMPLETED',
        },
    });

    console.log({ user1, user2, customer1, customer2, vehicle1, vehicle2, lead1, lead2, appointment1, appointment2 });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });