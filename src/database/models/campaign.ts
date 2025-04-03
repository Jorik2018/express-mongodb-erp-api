import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaign extends Document {
  description: string;
  completed: boolean;
}

const CampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  image: { type: String, required: true },
  gallery: [{ type: String, required: true }],
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Assuming sponsor is a string; adjust if it's a reference
  category: { type: String, required: true },

  categories: [{ type: String, required: true }],
  requirements: [{ type: String, required: true }],
  compensation: { type: String, required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Reference to User collection
  status: { type: String, required: true, enum: ['active', 'upcoming', 'completed'] },
});

const Campaign: Model<ICampaign> = mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;

