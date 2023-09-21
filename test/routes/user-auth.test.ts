// test/routes/auth.test.ts

import request, { Response } from 'supertest';
import app from '../../src/app';
import knex from '../../src/database/db';

const TEST_USERS = {
  ADMIN: { username: 'adminUser', password: 'password' },
  BASIC: { username: 'basicUser', password: 'password' },
  REGISTER: { username: 'registerUser', password: 'password' },
  LOGIN: { username: 'loginUser', password: 'password' },
  LOGOUT: { username: 'logoutUser', password: 'password' },
};

describe('API Auth Routes', () => {
  beforeAll((done) => {
    done();
  });

  beforeEach(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
    await knex.seed.run();
  });

  afterAll((done) => {
    knex.destroy();
    done();
  });

  describe('POST /api/auth/register', () => {
    it('When valid user data is provided, then a new user is created in the database', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(TEST_USERS.REGISTER);

      expect(res.statusCode).toBe(201);
      expect(res.body.user.username).toBe(TEST_USERS.REGISTER.username);

      const savedUser = await knex('users')
        .where('username', TEST_USERS.REGISTER.username)
        .first();
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(TEST_USERS.REGISTER.username);
    });
  });

  describe('POST /api/auth/login', () => {
    let response: Response;

    beforeAll(async () => {
      response = await request(app)
        .post('/api/auth/login')
        .send(TEST_USERS.LOGIN);
    });

    it('When valid credentials are provided, then the user is logged in', () => {
      expect(response.statusCode).toBe(200);
    });

    it('When a user is logged in, then a session cookie should be set', () => {
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    const agent = request.agent(app);
    let response: Response;

    beforeAll(async () => {
      await agent.post('/api/auth/login').send(TEST_USERS.LOGOUT);
    });

    it('When a user is logged in, then the user should be logged out', async () => {
      response = await agent.post('/api/auth/logout');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/users', () => {
    it('When users in database, then it should return the users', async () => {
      const agent = request.agent(app);
      await agent.post('/api/auth/login').send(TEST_USERS.ADMIN);
      const response: Response = await agent.get('/api/users');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/users/:id', () => {
    it(`When authorized, then a user's details are returned`, async () => {
      const agent = request.agent(app);

      const loginResponse = await agent
        .post('/api/auth/login')
        .send(TEST_USERS.BASIC);
      const userId = loginResponse.body.user.id;

      const res = await agent
        .get(`/api/users/${userId}`)
        .send(TEST_USERS.BASIC);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe(TEST_USERS.BASIC.username);
    });
  });
});
