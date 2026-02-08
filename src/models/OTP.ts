import mongoose, { Schema, Document } from 'mongoose';
import { IOTP } from '../types';

interface IOTPDocument extends Omit<IOTP, '_id'>, Document {}

const otpSchema = new Schema<IOTPDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['emailVerification', 'passwordReset'], required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

export default mongoose.model<IOTPDocument>('OTP', otpSchema);
