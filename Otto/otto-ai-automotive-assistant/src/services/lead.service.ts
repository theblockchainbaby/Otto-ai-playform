import { PrismaClient } from '@prisma/client';
import { Lead } from '../types/api.types';

const prisma = new PrismaClient();

export const createLead = async (leadData: Lead) => {
    return await prisma.lead.create({
        data: leadData,
    });
};

export const getLeads = async () => {
    return await prisma.lead.findMany();
};

export const getLeadById = async (id: string) => {
    return await prisma.lead.findUnique({
        where: { id },
    });
};

export const updateLead = async (id: string, leadData: Partial<Lead>) => {
    return await prisma.lead.update({
        where: { id },
        data: leadData,
    });
};

export const deleteLead = async (id: string) => {
    return await prisma.lead.delete({
        where: { id },
    });
};