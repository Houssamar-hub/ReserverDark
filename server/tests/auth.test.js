import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import createTestApp from './testApp.js';


let app;

const TEST_DB_URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI.replace('/reserverdark', '/reserverdark_test')
  : 'mongodb://localhost:27017/reserverdark_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  app = createTestApp();
}, 15000);

afterAll(async () => {
  // Drop test DB after all tests
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clean users collection before each test
  const collections = mongoose.connection.collections;
  if (collections.users) {
    await collections.users.deleteMany({});
  }
});


const validClient = {
  name: 'Ahmed Benali',
  email: 'ahmed@test.com',
  password: 'password123',
  phone: '0612345678',
  role: 'client',
};

const validOwner = {
  name: 'Fatima Zahra',
  email: 'fatima@test.com',
  password: 'securepass456',
  phone: '0698765432',
  role: 'owner',
};


describe('POST /api/auth/register', () => {

  it('âœ… devrait inscrire un client avec des donnÃ©es valides', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validClient.email);
    expect(res.body.user.role).toBe('client');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('âœ… devrait inscrire un propriÃ©taire avec le rÃ´le owner', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validOwner);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('owner');
    expect(res.body.user.name).toBe(validOwner.name);
  });

  it('âœ… devrait retourner un token JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient);

    expect(res.statusCode).toBe(201);
    const token = res.body.token;
    expect(typeof token).toBe('string');
    // JWT has 3 parts separated by dots
    expect(token.split('.')).toHaveLength(3);
  });

  it('âœ… le rÃ´le par dÃ©faut doit Ãªtre client si non prÃ©cisÃ©', async () => {
    const { role, ...withoutRole } = validClient;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutRole);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('client');
  });

  it('âŒ devrait refuser si email dÃ©jÃ  utilisÃ©', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(validClient);
    // Second with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('âŒ devrait refuser si le nom est manquant', async () => {
    const { name, ...withoutName } = validClient;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutName);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser si email est manquant', async () => {
    const { email, ...withoutEmail } = validClient;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutEmail);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser si mot de passe est manquant', async () => {
    const { password, ...withoutPassword } = validClient;
    const res = await request(app)
      .post('/api/auth/register')
      .send(withoutPassword);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser un mot de passe trop court (< 6 caractÃ¨res)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validClient, password: '123' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser un email avec format invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validClient, email: 'not-an-email' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2. POST /api/auth/login
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    // Register a user before each login test
    await request(app).post('/api/auth/register').send(validClient);
  });

  it('âœ… devrait connecter un utilisateur avec des identifiants valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email, password: validClient.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validClient.email);
    expect(res.body.message).toMatch(/successful/i);
  });

  it('âœ… le token retournÃ© doit Ãªtre un JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email, password: validClient.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('âœ… la rÃ©ponse ne doit pas contenir le mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email, password: validClient.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('âŒ devrait refuser avec un email incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@email.com', password: validClient.password });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('âŒ devrait refuser avec un mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('âŒ devrait refuser si email est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: validClient.password });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser si mot de passe est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('âŒ devrait refuser un compte bloquÃ©', async () => {
    // Block the user directly in DB
    const User = (await import('../models/User.js')).default;
    await User.findOneAndUpdate(
      { email: validClient.email },
      { isBlocked: true }
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validClient.email, password: validClient.password });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/blocked/i);
  });
});

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3. GET /api/auth/me
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

describe('GET /api/auth/me', () => {

  let token;

  beforeEach(async () => {
    // Register + login to get token
    const res = await request(app)
      .post('/api/auth/register')
      .send(validClient);
    token = res.body.token;
  });

  it('âœ… devrait retourner le profil de l\'utilisateur connectÃ©', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(validClient.email);
    expect(res.body.user.name).toBe(validClient.name);
  });

  it('âœ… le profil ne doit pas exposer le mot de passe', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('âŒ devrait refuser sans token Authorization', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  it('âŒ devrait refuser avec un token invalide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.faux.invalide');

    expect(res.statusCode).toBe(401);
  });

  it('âŒ devrait refuser avec un token expirÃ© ou malformÃ©', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.invalide.invalide');

    expect(res.statusCode).toBe(401);
  });
});
