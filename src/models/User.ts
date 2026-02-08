import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  fullName: { type: String, required: true },
  profileImage: { type: String, default: null },
  role: { type: String, enum: ['donor', 'campaignOwner', 'admin'], default: 'donor' },
  isVerified: { type: Boolean, default: false },
  isKYCCompleted: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  kycDocuments: [{ type: String }],
  refreshToken: { type: String, select: false }
}, { timestamps: true });

export default mongoose.model<IUserDocument>('User', userSchema);
