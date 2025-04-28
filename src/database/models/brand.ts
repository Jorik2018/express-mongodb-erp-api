import { Schema, Document, model, Model } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  description: string;
  user: string;
  imageUrl: String,
  slogan: string;
  canceled: boolean;
}

const BrandSchema: Schema = new Schema({
  name: { type: String, required: true },
  slogan: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  user: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  categories: { type: [String] },
  canceled: { type: Boolean }
});

const Brand: Model<IBrand> = model<IBrand>('Brand', BrandSchema);

export default Brand;

