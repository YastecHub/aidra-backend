import sgMail from '@sendgrid/mail';
import logger from '../config/logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendOTPEmail = async (email: string, otp: string, type: string): Promise<void> => {
  const subject = type === 'emailVerification' ? 'Verify Your Email' : 'Reset Your Password';
  const message = `Your OTP is: ${otp}. Valid for 10 minutes.`;

  logger.info(`Attempting to send ${type} email to: ${email}`);
  
  try {
    await sgMail.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject,
      text: message
    });
    
    logger.info(`Email sent successfully to ${email} via SendGrid`);
  } catch (error) {
    logger.error(`Email sending failed for ${email}:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      type
    });
    throw error;
  }
};
