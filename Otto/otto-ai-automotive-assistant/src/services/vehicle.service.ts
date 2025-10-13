import { PrismaClient } from '@prisma/client';
import { Vehicle } from '../types/vehicle.types';

const prisma = new PrismaClient();

export const createVehicle = async (data: Vehicle) => {
    return await prisma.vehicle.create({
        data,
    });
};

export const getVehicleById = async (id: number) => {
    return await prisma.vehicle.findUnique({
        where: { id },
    });
};

export const getAllVehicles = async () => {
    return await prisma.vehicle.findMany();
};

export const updateVehicle = async (id: number, data: Vehicle) => {
    return await prisma.vehicle.update({
        where: { id },
        data,
    });
};

export const deleteVehicle = async (id: number) => {
    return await prisma.vehicle.delete({
        where: { id },
    });
};