import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Replace with your secret

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
    return jwt.verify(token, JWT_SECRET);
};