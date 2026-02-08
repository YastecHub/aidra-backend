import mongoose, { Schema, Document } from 'mongoose';
import { IDonation } from '../types';

interface IDonationDocument extends Omit<IDonation, '_id'>, Document {}

const donationSchema = new Schema<IDonationDocument>({
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'crypto', 'bank'], required: true },
  transactionId: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IDonationDocument>('Donation', donationSchema);
