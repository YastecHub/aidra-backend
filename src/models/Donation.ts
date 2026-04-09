import mongoose, { Schema, Document } from 'mongoose';
import { IDonation } from '../types';

interface IDonationDocument extends Omit<IDonation, '_id'>, Document {}

const donationSchema = new Schema<IDonationDocument>({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  donorEmail: { type: String, default: null },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  cryptoAmount: { type: Number, default: null },
  cryptoCurrency: { type: String, default: null },
  paymentMethod: { type: String, enum: ['crypto'], default: 'crypto' },
  nowPaymentId: { type: String, unique: true, sparse: true },
  payAddress: { type: String, default: null },
  txHash: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ['waiting', 'confirming', 'confirmed', 'sending', 'partially_paid', 'finished', 'failed', 'refunded', 'expired'],
    default: 'waiting'
  },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  ipnData: { type: Schema.Types.Mixed, default: null },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IDonationDocument>('Donation', donationSchema);
