import { PrismaClient } from '@prisma/client';
import { Appointment } from '../types/api.types';

const prisma = new PrismaClient();

export const createAppointment = async (appointmentData: Appointment) => {
    return await prisma.appointment.create({
        data: appointmentData,
    });
};

export const getAppointments = async () => {
    return await prisma.appointment.findMany();
};

export const getAppointmentById = async (id: number) => {
    return await prisma.appointment.findUnique({
        where: { id },
    });
};

export const updateAppointment = async (id: number, appointmentData: Appointment) => {
    return await prisma.appointment.update({
        where: { id },
        data: appointmentData,
    });
};

export const deleteAppointment = async (id: number) => {
    return await prisma.appointment.delete({
        where: { id },
    });
};