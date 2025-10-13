import { PrismaClient } from '@prisma/client';
import { Call } from '../types/api.types';

const prisma = new PrismaClient();

export const createCall = async (callData: Call) => {
    return await prisma.call.create({
        data: callData,
    });
};

export const getCallById = async (id: number) => {
    return await prisma.call.findUnique({
        where: { id },
    });
};

export const getAllCalls = async () => {
    return await prisma.call.findMany();
};

export const updateCall = async (id: number, callData: Partial<Call>) => {
    return await prisma.call.update({
        where: { id },
        data: callData,
    });
};

export const deleteCall = async (id: number) => {
    return await prisma.call.delete({
        where: { id },
    });
};