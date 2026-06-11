import bcrypt from 'bcryptjs';
import User from '../models/User';
import OTP from '../models/OTP';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { generateOTP } from '../utils/otp';
import { sendOTPEmail } from '../utils/email';
import logger from '../config/logger';
import {
  ApiErrorCode,
  ConflictClientException,
  NotFoundClientException,
  UnauthorizedClientException,
  ValidationClientException
} from '../utils/clientError';
import { assertStrongPassword } from '../utils/passwordPolicy';

export const register = async (email: string, password: string, fullName: string, role: string = 'campaignOwner') => {
  assertStrongPassword(password);
  logger.info(`Registration attempt for email: ${email}`);
  
  const existingUser = await User.findOne({ email }).select('_id').lean();
  if (existingUser) {
    logger.warn(`Registration failed: Email already exists - ${email}`);
    throw new ConflictClientException('Email already registered', ApiErrorCode.DUPLICATE_EMAIL);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword, fullName, role });
  logger.info(`User created successfully: ${user._id}`);

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ userId: user._id, email, otp, type: 'emailVerification', expiresAt });
  
  try {
    await sendOTPEmail(email, otp, 'emailVerification');
    logger.info(`OTP email sent successfully to: ${email}`);
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    await OTP.deleteMany({ userId: user._id });
    logger.error(`Registration failed - email not sent to ${email}:`, error);
    throw new ValidationClientException('Failed to send verification email. Please try again later.');
  }

  return { message: 'Registration successful. Check your email inbox or spam for OTP.' };
};

export const verifyEmail = async (email: string, otp: string) => {
  logger.info(`Email verification attempt for: ${email}`);
  
  const otpRecord = await OTP.findOne({ email, otp, type: 'emailVerification' });
  if (!otpRecord) {
    logger.warn(`Invalid OTP attempt for: ${email}`);
    throw new ValidationClientException('Invalid OTP');
  }
  if (otpRecord.expiresAt < new Date()) {
    logger.warn(`Expired OTP attempt for: ${email}`);
    throw new ValidationClientException('OTP expired');
  }

  await User.findByIdAndUpdate(otpRecord.userId, { isVerified: true });
  await OTP.deleteOne({ _id: otpRecord._id });
  logger.info(`Email verified successfully: ${email}`);

  return { message: 'Email verified successfully' };
};

export const login = async (email: string, password: string) => {
  logger.info(`Login attempt for: ${email}`);
  
  const user = await User.findOne({ email }).select('+password email role isVerified isKYCCompleted fullName profileImage');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    logger.warn(`Failed login attempt for: ${email}`);
    throw new UnauthorizedClientException('Invalid credentials', ApiErrorCode.INVALID_CREDENTIALS);
  }
  if (!user.isVerified) {
    logger.warn(`Unverified user login attempt: ${email}`);
    throw new UnauthorizedClientException('Email not verified', ApiErrorCode.EMAIL_NOT_VERIFIED);
  }

  const payload = { 
    userId: user._id.toString(), 
    email: user.email, 
    role: user.role, 
    isVerified: user.isVerified, 
    isKYCCompleted: user.isKYCCompleted 
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user._id.toString() });

  await User.findByIdAndUpdate(user._id, { refreshToken });
  logger.info(`User logged in successfully: ${email}`);

  return { 
    accessToken, 
    refreshToken, 
    user: { 
      _id: user._id, 
      email: user.email, 
      fullName: user.fullName, 
      role: user.role, 
      profileImage: user.profileImage 
    } 
  };
};

export const forgotPassword = async (email: string) => {
  logger.info(`Password reset requested for: ${email}`);
  
  const user = await User.findOne({ email }).select('_id email').lean();
  if (!user) {
    logger.warn(`Password reset failed: User not found - ${email}`);
    throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ userId: user._id, email, otp, type: 'passwordReset', expiresAt });
  
  try {
    await sendOTPEmail(email, otp, 'passwordReset');
    logger.info(`Password reset OTP sent to: ${email}`);
  } catch (error) {
    await OTP.deleteOne({ userId: user._id, type: 'passwordReset' });
    logger.error(`Failed to send password reset OTP to ${email}:`, error);
    throw new ValidationClientException('Failed to send password reset email. Please try again later.');
  }

  return { message: 'OTP sent to your email' };
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  assertStrongPassword(newPassword);
  const otpRecord = await OTP.findOne({ email, otp, type: 'passwordReset' });
  if (!otpRecord) throw new ValidationClientException('Invalid OTP');
  if (otpRecord.expiresAt < new Date()) throw new ValidationClientException('OTP expired');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(otpRecord.userId, { password: hashedPassword, refreshToken: null });
  await OTP.deleteOne({ _id: otpRecord._id });

  return { message: 'Password reset successful' };
};

export const resendOTP = async (email: string, type: string) => {
  const user = await User.findOne({ email }).select('_id email').lean();
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);

  await OTP.deleteMany({ email, type });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await OTP.create({ userId: user._id, email, otp, type, expiresAt });
  
  try {
    await sendOTPEmail(email, otp, type);
    logger.info(`OTP resent successfully to: ${email}`);
  } catch (error) {
    await OTP.deleteOne({ userId: user._id, type });
    logger.error(`Failed to resend OTP to ${email}:`, error);
    throw new ValidationClientException('Failed to resend OTP email. Please try again later.');
  }

  return { message: 'OTP resent successfully' };
};
