import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  profileImage?: string;
  role: 'campaignOwner' | 'admin';
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
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonation {
  _id: string;
  donor?: Types.ObjectId;
  donorEmail?: string;
  campaign: Types.ObjectId;
  amount: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  paymentMethod: 'crypto';
  nowPaymentId?: string;
  payAddress?: string;
  txHash?: string;
  paymentStatus: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  status: 'pending' | 'completed' | 'failed';
  ipnData?: Record<string, any>;
  platformFee?: number;
  netAmount?: number;
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
