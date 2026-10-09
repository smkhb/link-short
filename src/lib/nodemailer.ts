import config from '@/config';
import nodemailer from 'nodemailer';

const nodemailerTransporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE,
});

export default nodemailerTransporter;
