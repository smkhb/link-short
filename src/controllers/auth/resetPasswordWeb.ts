import { ResetPasswordWebQuery } from '@/schemas/user.schema';
import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

export const resetPasswordWebHandler = async (
  request: FastifyRequest<{ Querystring: ResetPasswordWebQuery }>,
  reply: FastifyReply,
) => {
  const { token } = request.query;
  const resetPasswordPath = path.join(
    process.cwd(),
    'src',
    'utils',
    'reset-password.html',
  );

  try {
    const htmlForm = await fs.readFile(resetPasswordPath, 'utf-8');
    const tokenizedHtml = htmlForm.replace('{{token}}', token);
    reply.type('text/html').send(tokenizedHtml);
  } catch (error) {
    reply.status(500).send({
      message: 'An error occurred while loading the reset password page',
      status: 'error',
    });
    request.log.error(
      `An error occurred while loading the reset password page, ${error}`,
    );
    return;
  }
};
