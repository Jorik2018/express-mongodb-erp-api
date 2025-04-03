import { Schema, Document, model, Model } from 'mongoose';

export interface IApplication extends Document {
  contact: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  campaign: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  canceled: boolean;
}

const ApplicationSchema: Schema = new Schema({
  contact: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Contact'
  },
  campaign: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  canceled: { type: Boolean }
});

const Application: Model<IApplication> = model<IApplication>('Application', ApplicationSchema);

export default Application;

