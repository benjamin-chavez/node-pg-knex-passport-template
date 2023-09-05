// test/routes/api.test.ts

import request, { Response } from 'supertest';
import app from '../../src/app';
import knex from '../../src/database/db';

describe('GET /api', () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    knex.destroy();
    done();
  });

  describe('GET /api', () => {
    it('When API is running, then it should return 200 OK', async () => {
      const response: Response = await request(app).get('/api');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/routes', () => {
    it('When API endpoints exist, then it should return 200 OK', async () => {
      const response: Response = await request(app).get('/api/routes');
      expect(response.statusCode).toBe(200);
    });
  });
});
