import config from '@/config';
import nodemailer from 'nodemailer';

const nodemailerTransporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
});

export const sendForgotPasswordEmail = async (to: string, token: string) => {
  try {
    await nodemailerTransporter.verify();

    await nodemailerTransporter.sendMail({
      from: `"Shortly" <no-reply@linkshort.local>`,
      to,
      replyTo: 'no-reply@linkshort.local',
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://localhost:${config.PORT}/api/auth/reset-password?token=${token}\n\nIf you did not request this, please ignore this email.`,
    });
  } catch (error) {
    console.error('Error verifying SMTP transporter:', error);
    throw new Error('Failed to verify SMTP transporter');
  }
};

export const sendResetPasswordConfirmationEmail = async (to: string) => {
  try {
    await nodemailerTransporter.verify();

    await nodemailerTransporter.sendMail({
      from: `"Shortly" <no-reply@linkshort.local>`,
      to,
      replyTo: 'no-reply@linkshort.local',
      subject: 'Password Reset Confirmation',
      text: `Your password has been reset successfully.\n\nIf you did not request this, please ignore this email.`,
    });
  } catch (error) {
    console.error('Error verifying SMTP transporter:', error);
    throw new Error('Failed to verify SMTP transporter');
  }
};
