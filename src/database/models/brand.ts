import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  description: string;
  slogan: string;
  canceled: boolean;
}

const BrandSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  slogan: { type: String },
  imageUrl: { type: String },
  categories: { type: [String]},
  canceled: { type: Boolean}
});

const Brand: Model<IBrand> = mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;

