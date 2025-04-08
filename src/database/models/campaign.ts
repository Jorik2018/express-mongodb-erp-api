import { Schema, Document, Model, model } from 'mongoose';

export interface ICampaign extends Document {
  description: string;
  completed: boolean;
}

const CampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  coverImage: { type: String, required: true },
  gallery: [{ type: String, required: true }],
  brand: {
    required: true,
    type: Schema.Types.ObjectId, ref: 'Brand'
  },
  user: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sponsor: { type: Schema.Types.ObjectId, ref: 'Company' }, // Assuming sponsor is a string; adjust if it's a reference
  categories: [{ type: String, required: true }],
  requirements: [{ type: String }],
  deliverables: [{ type: String }],
  budget: { type: String },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Reference to User collection
  status: { type: String, required: true, enum: ['active', 'upcoming', 'completed', 'draft'] },
});

const Campaign: Model<ICampaign> = model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;

