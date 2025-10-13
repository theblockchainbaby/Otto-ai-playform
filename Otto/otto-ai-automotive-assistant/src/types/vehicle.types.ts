export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    price: number;
    mileage: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}