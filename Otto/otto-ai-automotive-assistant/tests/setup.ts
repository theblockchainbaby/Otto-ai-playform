import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

jest.setTimeout(30000); // Set a timeout for tests to avoid hanging issues.