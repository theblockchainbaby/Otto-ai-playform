import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../types/auth.types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (email: string, password: string): Promise<User> => {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });
    return user;
};

export const loginUser = async (email: string, password: string): Promise<string | null> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        return token;
    }
    return null;
};

export const authenticateToken = (token: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, async (err, user) => {
            if (err) return reject(err);
            const foundUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
            resolve(foundUser);
        });
    });
};