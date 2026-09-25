import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import createTestApp from './testApp.js';

// =============================================================================
// Configuration de la base de donnees de test
// =============================================================================

let app;

const TEST_DB_URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI.replace('/reserverdark', '/reserverdark_test')
  : 'mongodb://localhost:27017/reserverdark_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  app = createTestApp();
}, 15000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  if (collections.users) {
    await collections.users.deleteMany({});
  }
});

// =============================================================================
// Donnees de test
// =============================================================================

const clientValide = {
  name: 'Ahmed Benali',
  email: 'ahmed@test.com',
  password: 'password123',
  phone: '0612345678',
  role: 'client',
};

const proprietaireValide = {
  name: 'Fatima Zahra',
  email: 'fatima@test.com',
  password: 'securepass456',
  phone: '0698765432',
  role: 'owner',
};

// =============================================================================
// 1. POST /api/auth/register
// =============================================================================

describe('POST /api/auth/register', () => {

  it('devrait inscrire un client avec des donnees valides', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(clientValide);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(clientValide.email);
    expect(res.body.user.role).toBe('client');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('devrait inscrire un proprietaire avec le role owner', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(proprietaireValide);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('owner');
    expect(res.body.user.name).toBe(proprietaireValide.name);
  });

  it('devrait retourner un token JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(clientValide);

    expect(res.statusCode).toBe(201);
    const token = res.body.token;
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('le role par defaut doit etre client si non precise', async () => {
    const { role, ...sanRole } = clientValide;
    const res = await request(app)
      .post('/api/auth/register')
      .send(sanRole);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('client');
  });

  it('doit refuser si email deja utilise', async () => {
    await request(app).post('/api/auth/register').send(clientValide);
    const res = await request(app)
      .post('/api/auth/register')
      .send(clientValide);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('doit refuser si le nom est manquant', async () => {
    const { name, ...sanNom } = clientValide;
    const res = await request(app)
      .post('/api/auth/register')
      .send(sanNom);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser si email est manquant', async () => {
    const { email, ...sanEmail } = clientValide;
    const res = await request(app)
      .post('/api/auth/register')
      .send(sanEmail);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser si mot de passe est manquant', async () => {
    const { password, ...sanPassword } = clientValide;
    const res = await request(app)
      .post('/api/auth/register')
      .send(sanPassword);

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser un mot de passe inferieur a 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...clientValide, password: '123' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser un email avec un format invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...clientValide, email: 'pas-un-email' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});

// =============================================================================
// 2. POST /api/auth/login
// =============================================================================

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(clientValide);
  });

  it('devrait connecter un utilisateur avec des identifiants valides', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email, password: clientValide.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(clientValide.email);
    expect(res.body.message).toMatch(/successful/i);
  });

  it('le token retourne doit etre un JWT valide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email, password: clientValide.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('la reponse ne doit pas contenir le mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email, password: clientValide.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('doit refuser avec un email incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mauvais@email.com', password: clientValide.password });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('doit refuser avec un mot de passe incorrect', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email, password: 'mauvaispassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('doit refuser si email est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: clientValide.password });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser si mot de passe est manquant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it('doit refuser un compte bloque par l administrateur', async () => {
    const User = (await import('../models/User.js')).default;
    await User.findOneAndUpdate(
      { email: clientValide.email },
      { isBlocked: true }
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: clientValide.email, password: clientValide.password });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/blocked/i);
  });

});

// =============================================================================
// 3. GET /api/auth/me
// =============================================================================

describe('GET /api/auth/me', () => {

  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(clientValide);
    token = res.body.token;
  });

  it('devrait retourner le profil de l utilisateur connecte', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(clientValide.email);
    expect(res.body.user.name).toBe(clientValide.name);
  });

  it('le profil ne doit pas exposer le mot de passe', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('doit refuser si aucun token Authorization n est fourni', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  it('doit refuser avec un token invalide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.faux.invalide');

    expect(res.statusCode).toBe(401);
  });

  it('doit refuser avec un token malformed', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.invalide.invalide');

    expect(res.statusCode).toBe(401);
  });

});
