import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User';
import OTP from '../models/OTP';
import * as emailUtils from '../utils/email';

let mongoServer: MongoMemoryServer;

jest.mock('../utils/email', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(undefined)
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await OTP.deleteMany({});
  jest.clearAllMocks();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Registration successful');
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'hashedpass',
        fullName: 'Existing User'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should fail with invalid credentials', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        fullName: 'Test User',
        isVerified: true
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
    });

    it('should fail with unverified email', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'hashedpass',
        fullName: 'Test User',
        isVerified: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });
  });
});
