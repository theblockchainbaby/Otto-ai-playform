import { PrismaClient } from '@prisma/client';
import { Customer } from '../types/customer.types';

const prisma = new PrismaClient();

export const createCustomer = async (data: Customer) => {
    return await prisma.customer.create({
        data,
    });
};

export const getCustomerById = async (id: string) => {
    return await prisma.customer.findUnique({
        where: { id },
    });
};

export const updateCustomer = async (id: string, data: Partial<Customer>) => {
    return await prisma.customer.update({
        where: { id },
        data,
    });
};

export const deleteCustomer = async (id: string) => {
    return await prisma.customer.delete({
        where: { id },
    });
};

export const getAllCustomers = async () => {
    return await prisma.customer.findMany();
};