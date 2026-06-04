import { Response } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/authService';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import User from '../models/User';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role } = req.body;
    const result = await authService.register(email, password, fullName, role);
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error);
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (error) {
    sendError(res, error);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const resendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, type } = req.body;
    const result = await authService.resendOTP(email, type);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required');
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    const payload = { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role, 
      isVerified: user.isVerified, 
      isKYCCompleted: user.isKYCCompleted 
    };
    const accessToken = generateAccessToken(payload);

    sendSuccess(res, { accessToken }, 200, 'Token refreshed successfully');
  } catch (error) {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user?.userId, { refreshToken: null });
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    sendError(res, error);
  }
};
