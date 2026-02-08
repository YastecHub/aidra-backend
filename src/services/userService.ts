import bcrypt from 'bcryptjs';
import User from '../models/User';

export const getProfile = async (userId: string) => {
  return await User.findById(userId);
};

export const updateProfile = async (userId: string, updates: any) => {
  const allowedUpdates = ['fullName', 'profileImage'];
  const filteredUpdates = Object.keys(updates)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj: any, key) => ({ ...obj, [key]: updates[key] }), {});

  return await User.findByIdAndUpdate(userId, filteredUpdates, { new: true });
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new Error('User not found');
  if (!(await bcrypt.compare(oldPassword, user.password))) throw new Error('Incorrect old password');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  return { message: 'Password changed successfully' };
};

export const submitKYC = async (userId: string, documents: string[]) => {
  await User.findByIdAndUpdate(userId, { kycDocuments: documents, kycStatus: 'pending' });
  return { message: 'KYC submitted for review' };
};

export const getKYCStatus = async (userId: string) => {
  const user = await User.findById(userId).select('kycStatus isKYCCompleted');
  return user;
};
