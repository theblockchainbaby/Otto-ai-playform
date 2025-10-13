import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { prisma } from '../src/services/database.service'; // Adjust the path as necessary

describe('Customer API', () => {
  let customerId: string;

  beforeAll(async () => {
    // Seed the database with a customer for testing
    const customer = await prisma.customer.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
      },
    });
    customerId = customer.id;
  });

  afterAll(async () => {
    // Clean up the database after tests
    await prisma.customer.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a new customer', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send({
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '0987654321',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Jane Smith');
  });

  it('should retrieve a customer by ID', async () => {
    const response = await request(app).get(`/api/customers/${customerId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', customerId);
    expect(response.body.name).toBe('John Doe');
  });

  it('should update a customer', async () => {
    const response = await request(app)
      .put(`/api/customers/${customerId}`)
      .send({
        name: 'John Updated',
        email: 'john.updated@example.com',
        phone: '1112223333',
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John Updated');
  });

  it('should delete a customer', async () => {
    const response = await request(app).delete(`/api/customers/${customerId}`);

    expect(response.status).toBe(204);
  });
});