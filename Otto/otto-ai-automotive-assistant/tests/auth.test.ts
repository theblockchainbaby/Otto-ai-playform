import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { createUser, loginUser } from '../src/services/auth.service'; // Adjust the path as necessary

describe('Authentication Tests', () => {
  let user;

  beforeAll(async () => {
    user = await createUser({
      email: 'testuser@example.com',
      password: 'Password123!',
    });
  });

  afterAll(async () => {
    // Clean up the test user from the database
    await deleteUser(user.id); // Implement deleteUser in your auth service
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'Password123!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'WrongPassword!',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should not register a user with an existing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: user.email,
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Email already in use');
  });
});