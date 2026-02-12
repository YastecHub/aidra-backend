import { Resend } from 'resend';
import logger from '../config/logger';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendOTPEmail = async (email: string, otp: string, type: string): Promise<void> => {
  const subject = type === 'emailVerification' ? 'Verify Your Email' : 'Reset Your Password';
  const html = `<strong>Your OTP is: ${otp}</strong><p>Valid for 10 minutes.</p>`;

  logger.info(`Attempting to send ${type} email to: ${email}`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: [email],
      subject,
      html
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    logger.info(`Email sent successfully to ${email} via Resend`);
  } catch (error) {
    logger.error(`Email sending failed for ${email}:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      type
    });
    throw error;
  }
};
