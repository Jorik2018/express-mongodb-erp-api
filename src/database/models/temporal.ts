import { Schema, Document, model } from 'mongoose';

export interface ITemporal extends Document {
  content: string;
}

const TemporalSchema: Schema = new Schema({
  content: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false,
});

const Temporal = model<ITemporal>('Temporal', TemporalSchema);

export default Temporal;
