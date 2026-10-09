import { usersTable } from '@/db/schema';
import { db } from '@/lib/drizzle';
import { generateResetLinkToken } from '@/lib/jwt';
import nodemailerTransporter from '@/lib/nodemailer';
import { ForgotPassword } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { hashToken } from '@/lib/hashToken';

export const forgotPasswordHandler = async (
  request: FastifyRequest<{ Body: ForgotPassword }>,
  reply: FastifyReply,
): Promise<void> => {
  const { email } = request.body;

  try {
    const isEmailValid = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (isEmailValid.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return reply.status(200).send({
        message: `If that email address is in our system, we have sent a reset link to it. Please check your email.`,
        status: 'success',
      });
    }

    const passwordResetToken = generateResetLinkToken({ email });
    const hashedToken = hashToken(passwordResetToken);
    await db
      .update(usersTable)
      .set({ passwordResetToken: hashedToken })
      .where(eq(usersTable.email, email));

    await nodemailerTransporter.verify();
    await nodemailerTransporter.sendMail({
      from: `"Shortly" <no-reply@linkshort.local>`,
      to: email,
      replyTo: 'no-reply@linkshort.local',
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://localhost:3000/reset-password?token=${passwordResetToken}\n\nIf you did not request this, please ignore this email.`,
    });

    reply.log.info(`Email sent to ${email} for password reset`);
    reply.status(200).send({
      message: `If that email address is in our system, we have sent a reset link to it. Please check your email.`,
      status: 'success',
    });
  } catch (error) {
    reply.status(500).send({
      message: 'An error occurred while sending the password reset email',
      status: 'error',
    });
    request.log.error(
      `An error occurred while sending the password reset email to ${email}, ${error}`,
    );
    return;
  }
};
