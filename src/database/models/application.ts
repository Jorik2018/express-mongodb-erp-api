import { Schema, model, Model, InferSchemaType } from 'mongoose';

const applicationSchema: Schema = new Schema({
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

export type IApplication = InferSchemaType<typeof applicationSchema>;

const Application: Model<IApplication> = model<IApplication>('Application', applicationSchema);

export default Application;

