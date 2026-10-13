import { FastifyInstance } from "fastify";
import { makeUser } from "../factories/makeUser";
import { buildTestApp } from "../helpers/app";
import { clearDatabase } from "../helpers/db";

describe('POST /api/auth/forgot-password', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should send a password reset email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/forgot-password',
      payload: {
        email: 'user@example.com',
      },
    });

    expect(response.statusCode).toBe(200);
  });
});
