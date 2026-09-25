import request from 'supertest';
import app from '../../src/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/utils/hash';

const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000';

describe('Auth API', () => {
  beforeAll(async () => {
    // Ensure test user exists
    const passwordHash = await hashPassword('Test@1234');
    await prisma.user.upsert({
      where: { email: 'testuser@test.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'testuser@test.com',
        passwordHash,
        role: 'CITIZEN',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'NewPass123',
          role: 'CITIZEN',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('newuser@test.com');
    });

    it('should return 409 for existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 1',
          email: 'existing@test.com',
          password: 'Pass1234',
          role: 'CITIZEN',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'existing@test.com',
          password: 'Pass1234',
          role: 'CITIZEN',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User',
          email: 'invalid-email',
          password: 'Pass1234',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User',
          email: 'weak@test.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(401);
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'Test@1234',
        });
      token = response.body.token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('role');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });
  });
});