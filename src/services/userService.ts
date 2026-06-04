import bcrypt from 'bcryptjs';
import User from '../models/User';
import { ApiErrorCode, NotFoundClientException, ValidationClientException } from '../utils/clientError';

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .select('fullName email role profileImage isVerified isKYCCompleted kycStatus kycDocuments createdAt updatedAt')
    .lean();
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  return user;
};

export const updateProfile = async (userId: string, updates: any) => {
  const allowedUpdates = ['fullName', 'profileImage'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj: any, key) => ({ ...obj, [key]: updates[key] }), {});

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true })
    .select('fullName email role profileImage isVerified isKYCCompleted kycStatus createdAt updatedAt')
    .lean();

  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  return user;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  if (!(await bcrypt.compare(oldPassword, user.password))) {
    throw new ValidationClientException('Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  return { message: 'Password changed successfully' };
};

export const submitKYC = async (userId: string, documents: string[]) => {
  const user = await User.findByIdAndUpdate(userId, { kycDocuments: documents, kycStatus: 'pending' })
    .select('_id')
    .lean();
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  return { message: 'KYC submitted for review' };
};

export const getKYCStatus = async (userId: string) => {
  const user = await User.findById(userId).select('kycStatus isKYCCompleted').lean();
  if (!user) throw new NotFoundClientException('User not found', ApiErrorCode.USER_NOT_FOUND);
  return user;
};
