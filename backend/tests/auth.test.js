import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import './setup.js';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  const testUser = {
    name: 'Test Candidate',
    email: 'candidate@test.com',
    password: 'SecurePassword123!'
  };

  test('POST /api/v1/auth/register - should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    // Verify password is not exposed
    expect(res.body.data.user.password).toBeUndefined();
  });

  test('POST /api/v1/auth/register - should reject duplicate email with 409 Conflict', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('POST /api/v1/auth/login - should log in existing user with correct credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  test('POST /api/v1/auth/login - should reject invalid credentials with 401 Unauthorized', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('POST /api/v1/auth/refresh-token - should rotate tokens given valid refresh token', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const refreshToken = regRes.body.data.tokens.refreshToken;

    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
  });
});

