import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
    return await prisma.user.findMany();
};

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

export const createUser = async (data: { email: string; password: string; }) => {
    return await prisma.user.create({
        data,
    });
};

export const updateUser = async (id: number, data: { email?: string; password?: string; }) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};

export const deleteUser = async (id: number) => {
    return await prisma.user.delete({
        where: { id },
    });
};

// Add similar functions for other models like Customer, Vehicle, Lead, Call, Appointment as needed.