import { Schema, Document, Model, model } from 'mongoose';

export interface ICompany extends Document {
  description: string;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    website: { type: String },
    industry: { type: String },
    user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    insertDate: { type: Date, default: Date.now },
    updateDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CompanySchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updateDate = new Date();
  }
  next();
});

const Company: Model<ICompany> = model<ICompany>('Company', CompanySchema);

export default Company;

