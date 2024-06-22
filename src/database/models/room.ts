import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  id?: string;
  name: string;
  description: string;
  userId: string;
}

const mapping = (schema: Schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  });
  return schema;
}

const Room: Model<IRoom> = mongoose.model<IRoom>('Room', mapping(new Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true },
  description: { type: String },
})));

export default Room;

