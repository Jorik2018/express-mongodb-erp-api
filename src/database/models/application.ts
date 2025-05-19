import { Schema, model, Model, InferSchemaType } from 'mongoose';


const mediaSchema: Schema = new Schema({
  id: { type: String, required: true },
  provider: { type: String, required: true },
  thumbnail: { type: String, required: true },
  href: { type: String },
  type: { type: String, required: true },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 }
});

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
  canceled: { type: Boolean },
  content: [{ type: mediaSchema, default: [] }]
});

export type IApplication = InferSchemaType<typeof applicationSchema>;

const Application: Model<IApplication> = model<IApplication>('Application', applicationSchema);

export default Application;

