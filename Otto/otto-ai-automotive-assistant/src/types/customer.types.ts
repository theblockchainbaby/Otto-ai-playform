export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerCreateInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}

export interface CustomerUpdateInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
}