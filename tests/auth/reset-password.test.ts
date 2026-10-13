import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/app';
import { clearDatabase } from '../helpers/db';
import { makeUser } from '../factories/makeUser';
import { sendForgotPasswordEmail } from '@/lib/nodemailer';

vi.mock('@/lib/nodemailer', async (importOriginal: () => any) => {
  const original = await importOriginal();
  return {
    ...original,
    sendForgotPasswordEmail: vi.fn(),
  };
});

const requestResetAndGetToken = async (app: FastifyInstance) => {
  await app.inject({
    method: 'POST',
    url: '/api/auth/forgot-password',
    payload: { email: 'user@example.com' },
  });

  const mockedSend = vi.mocked(sendForgotPasswordEmail);
  return mockedSend.mock.calls[0][1];
};

describe('GET /api/auth/reset-password', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await clearDatabase();
    await makeUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resets the password with the token from the email', async () => {
    const token = await requestResetAndGetToken(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/reset-password',
      payload: { token, newPassword: 'newpassword123' },
    });

    expect(res.statusCode).toBe(200);
  });
});
