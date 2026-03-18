import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const canUseSmtp = Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);

const transporter = canUseSmtp
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null;

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  if (!transporter) {
    logger.info(`Email provider not configured. Intended email to ${to}: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: env.FROM_EMAIL,
    to,
    subject,
    html
  });
};

export const sendOtpEmail = async (to: string, name: string, otp: string): Promise<void> => {
  const html = `<h2>Hello ${name},</h2><p>Your verification code is <b>${otp}</b>.</p><p>This code expires in 10 minutes.</p>`;
  await sendEmail(to, 'Verify your email', html);
};

export const sendResetPasswordEmail = async (to: string, resetLink: string): Promise<void> => {
  const html = `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`;
  await sendEmail(to, 'Reset your password', html);
};
