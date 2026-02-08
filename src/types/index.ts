import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  profileImage?: string;
  role: 'donor' | 'campaignOwner' | 'admin';
  isVerified: boolean;
  isKYCCompleted: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments: string[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOTP {
  _id: string;
  userId?: string;
  email: string;
  otp: string;
  type: 'emailVerification' | 'passwordReset';
  expiresAt: Date;
}

export interface ICampaign {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  image: string;
  owner: Types.ObjectId;
  status: 'draft' | 'active' | 'underReview' | 'completed' | 'rejected';
  category?: string;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonation {
  _id: string;
  donor: Types.ObjectId;
  campaign: Types.ObjectId;
  amount: number;
  paymentMethod: 'card' | 'crypto' | 'bank';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    isVerified: boolean;
    isKYCCompleted: boolean;
  };
}
