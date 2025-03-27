import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  description: string;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  industry: { type: String, required: true },
});

const Campaign: Model<ICompany> = mongoose.model<ICompany>('Company', CompanySchema);

export default Campaign;

