import mongoose, { Schema, Document } from 'mongoose';
import { ICampaign } from '../types';

interface ICampaignDocument extends Omit<ICampaign, '_id'>, Document {}

const campaignSchema = new Schema<ICampaignDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  image: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'active', 'underReview', 'completed', 'rejected'], default: 'draft' },
  category: { type: String },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<ICampaignDocument>('Campaign', campaignSchema);
