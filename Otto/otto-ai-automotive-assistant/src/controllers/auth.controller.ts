import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../types/auth.types';

export const register = async (req: Request, res: Response) => {
    const { email, password }: User = req.body;

    try {
        const newUser = await AuthService.register(email, password);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password }: User = req.body;

    try {
        const token = await AuthService.login(email, password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const logout = (req: Request, res: Response) => {
    // Implement logout logic if needed
    res.status(200).json({ message: 'Logout successful' });
};